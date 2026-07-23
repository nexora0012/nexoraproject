const User = require("../models/User");
const Subscription = require("../models/Subscription");
const WalletTransaction = require("../models/WalletTransaction");
const Payment = require("../models/Payment");
const Announcement = require("../models/Announcement");

const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();

    await Subscription.updateMany(
      {
        user: userId,
        status: "Active",
        endDate: { $lt: today },
      },
      {
        $set: { status: "Expired" },
      }
    );

    const user = await User.findById(userId).select(
      "fullName email mobile walletBalance"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [
      activeSubscriptions,
      recentTransactions,
      recentPayments,
      pendingSubscriptions,
      creditedSubscriptions,
      announcements,
    ] = await Promise.all([
      Subscription.find({
        user: userId,
        status: "Active",
        endDate: { $gte: today },
      })
        .populate("plan")
        .sort({ createdAt: -1 }),

      WalletTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5),

      Payment.find({ user: userId })
        .populate("plan", "title")
        .sort({ createdAt: -1 })
        .limit(5),

      Subscription.find({
        user: userId,
        status: "Active",
        returnStatus: "Pending",
      }),

      Subscription.find({
        user: userId,
        returnStatus: "Credited",
      }),

      Announcement.find({ status: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const pendingReturn = pendingSubscriptions.reduce(
      (sum, item) => sum + Number(item.returnAmount || 0),
      0
    );

    const totalMaturityReturn = creditedSubscriptions.reduce(
      (sum, item) => sum + Number(item.returnAmount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
        },

        wallet: {
          balance: Number(user.walletBalance || 0),
          pendingReturn,
          pendingReturnCount: pendingSubscriptions.length,
          totalMaturityReturn,
        },

        subscriptions: activeSubscriptions.map((sub) => ({
          id: sub._id,
          plan: sub.plan,
          startDate: sub.startDate,
          endDate: sub.endDate,
          status: sub.status,
          amountPaid: sub.amountPaid,
          returnAmount: sub.returnAmount,
          paymentMethod: sub.paymentMethod,
          paymentStatus: sub.paymentStatus,
          returnStatus: sub.returnStatus,
          daysRemaining: Math.max(
            0,
            Math.ceil(
              (new Date(sub.endDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          ),
        })),

        announcements,
        recentTransactions,
        recentPayments,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
};

module.exports = {
  getUserDashboard,
};
