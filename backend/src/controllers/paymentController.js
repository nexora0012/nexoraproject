const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");

const Plan = require("../models/Plan");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const WalletTransaction = require('../models/WalletTransaction');
const ReferralSettings = require('../models/ReferralSettings');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {planId} = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan ID",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are not configured",
      });
    }

    const user = await User.findById(userId).select(
      "name email mobile isActive",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const plan = await Plan.findOne({
      _id: planId,
      status: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive",
      });
    }

    /*
     * Multiple simultaneous plans are allowed — a user is not
     * blocked from buying a new plan just because another one
     * is still Active. Each purchase gets its own Subscription
     * record and its own Payment history entry.
     */

    const amount = Number(plan.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan price",
      });
    }

    /*
     * Razorpay expects amount in paise.
     * ₹299 becomes 29900 paise.
     */
    const amountInPaise = Math.round(amount * 100);

    const receipt =
      `NEXORA-${Date.now()}-${userId
        .toString()
        .slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: userId.toString(),
        planId: plan._id.toString(),
        planTitle: plan.title,
      },
    });

    await Payment.create({
      user: userId,
      plan: plan._id,
      amount,
      currency: "INR",
      method: "Razorpay",
      razorpayOrderId: order.id,
      receipt,
      transactionId: order.id,
      status: "Created",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      plan: {
        id: plan._id,
        title: plan.title,
        price: amount,
        duration: Number(plan.duration),
      },
      customer: {
        name: user.name || "",
        email: user.email || "",
        contact: user.mobile || "",
      },
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        "Unable to create payment order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are incomplete",
      });
    }

    const paymentRecord = await Payment.findOne({
      user: userId,
      razorpayOrderId: razorpay_order_id,
    }).populate("plan");

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    if (paymentRecord.status === "Success") {
      const existingSubscription =
        await Subscription.findById(
          paymentRecord.subscription,
        ).populate("plan");

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        subscription: existingSubscription,
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET,
      )
      .update(
        `${paymentRecord.razorpayOrderId}|${razorpay_payment_id}`,
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      paymentRecord.status = "Failed";
      await paymentRecord.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    /*
     * Check Razorpay payment status directly.
     */
    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id,
      );

    if (
      razorpayPayment.order_id !==
      paymentRecord.razorpayOrderId
    ) {
      paymentRecord.status = "Failed";
      await paymentRecord.save();

      return res.status(400).json({
        success: false,
        message: "Payment order does not match",
      });
    }

    const expectedAmount = Math.round(
      Number(paymentRecord.amount) * 100,
    );

    if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {
      paymentRecord.status = "Failed";
      await paymentRecord.save();

      return res.status(400).json({
        success: false,
        message: "Payment amount does not match",
      });
    }

    /*
     * Only a fully "captured" payment guarantees Razorpay has
     * actually settled the charge. "authorized" means the card/UPI
     * hold succeeded but funds have not been captured yet, so the
     * plan must not be activated on that status alone.
     */
    if (razorpayPayment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not captured yet. Plan has not been activated.",
      });
    }

    /*
     * Multiple simultaneous plans are allowed — do not block
     * activation just because another subscription is still
     * Active. Each successful payment creates its own
     * Subscription record.
     */

    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(
      endDate.getDate() +
        Number(paymentRecord.plan.duration),
    );

    const subscription =
     await Subscription.create({
       user: paymentRecord.user,
       plan: paymentRecord.plan._id,
       startDate,
       endDate,
       status: "Active",
       amountPaid: Number(
         paymentRecord.plan.price || 0,
         ),
        returnAmount: Number(
         paymentRecord.plan.returnAmount || 0,
        ),
         paymentMethod: "Razorpay",
         paymentStatus: "Paid",
         returnStatus:
          Number(
            paymentRecord.plan.returnAmount || 0,
           ) > 0
            ? "Pending"
            : "NotApplicable",
       });

    paymentRecord.subscription = subscription._id;
    paymentRecord.transactionId = razorpay_payment_id;
    paymentRecord.razorpayPaymentId = razorpay_payment_id;
    paymentRecord.razorpaySignature = razorpay_signature;
    paymentRecord.status = "Success";

    await paymentRecord.save();
    // Referral reward — only fires once, on the buyer's first successful purchase
    try {
      const buyer = await User.findById(paymentRecord.user);

      if (buyer && buyer.referredBy && !buyer.referralRewardGiven) {
        const settings = await ReferralSettings.findOne();

        if (settings?.enabled) {
          const purchaseAmount = Number(paymentRecord.amount);

          if (purchaseAmount >= Number(settings.minPurchaseAmount || 0)) {
            const rewardAmount =
              settings.rewardType === 'percentage'
                ? (purchaseAmount * Number(settings.rewardValue)) / 100
                : Number(settings.rewardValue);

            if (rewardAmount > 0) {
              const referrer = await User.findById(buyer.referredBy);

              if (referrer) {
                referrer.walletBalance = Number(referrer.walletBalance || 0) + rewardAmount;
                await referrer.save();

                await WalletTransaction.create({
                  user: referrer._id,
                  type: 'credit',
                  category: 'ReferralBonus',
                  amount: rewardAmount,
                  description: `Referral bonus for ${buyer.fullName}'s first plan purchase`,
                  createdBy: 'System',
                  referenceId: `REFERRAL_${buyer._id}`,
                });
              }
            }
          }
        }

        buyer.referralRewardGiven = true;
        await buyer.save();
      }
    } catch (referralError) {
      // Referral failures must never break a successful payment
      console.error('Referral reward error:', referralError);
    }

    await subscription.populate(
      "plan",
      "title description price duration category image returnAmount",
    );

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and plan activated",
      subscription,
      payment: {
        paymentId:
          paymentRecord.razorpayPaymentId,
        orderId:
          paymentRecord.razorpayOrderId,
        amount: paymentRecord.amount,
        status: paymentRecord.status,
      },
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify payment",
    });
  }
};

const getMyPaymentHistory = async (
  req,
  res,
) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
    })
      .populate(
        'plan',
        'title description duration returnAmount',
      )
      .populate(
        'subscription',
        'status startDate endDate returnStatus',
      )
      .sort({
        createdAt: -1,
      })
      .select(
        [
          'plan',
          'subscription',
          'amount',
          'currency',
          'method',
          'transactionId',
          'razorpayOrderId',
          'razorpayPaymentId',
          'status',
          'failureReason',
          'createdAt',
        ].join(' '),
      )
      .limit(100);

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      'Payment history error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load payment history',
    });
  }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getMyPaymentHistory,
};