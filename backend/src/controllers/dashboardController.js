const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const WalletTransaction = require('../models/WalletTransaction');
const Payment = require('../models/Payment');

const dashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlans = await Plan.countDocuments();

    const wallet = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$walletBalance' },
        },
      },
    ]);

    const recentTransactions = await WalletTransaction.find()
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivity = recentTransactions.map((tx) => {
      const name = tx.user?.fullName || 'A user';
      const action = tx.type === 'credit' ? 'received' : 'debited';
      return `${name} ${action} ₹${tx.amount} (${tx.category || 'Wallet'})`;
    });

    const latestUsersRaw = await User.find()
      .select('fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    const latestUsers = latestUsersRaw.map((u) => ({ name: u.fullName }));

    res.json({
      success: true,
      totalUsers,
      totalPlans,
      walletBalance: wallet.length > 0 ? wallet[0].total : 0,
      pendingWithdrawals: 0,
      recentActivity,
      latestUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getUserDashboard = async (
  req,
  res,
) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const user = await User.findById(
      userId,
    ).select(
      'fullName email mobile walletBalance',
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    /*
     * Genuinely active subscriptions only. Do NOT mark expired
     * subscriptions here — that is the maturity scheduler's job.
     * Doing it here could expire a subscription before its
     * pending return has been credited.
     */
    const [
      currentSubscriptions,
      pendingReturnResult,
      maturityReturnResult,
      recentTransactions,
      recentPayments,
    ] = await Promise.all([
      Subscription.find({
        user: userId,
      })
        .populate(
          'plan',
          [
            'title',
            'description',
            'price',
            'duration',
            'returnAmount',
            'category',
            'image',
          ].join(' '),
        )
        .sort({
          createdAt: -1,
        }),

      Subscription.aggregate([
        {
          $match: {
            user: user._id,
            status: 'Active',
            returnStatus: {
              $in: [
                'Pending',
                'Processing',
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$returnAmount',
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      WalletTransaction.aggregate([
        {
          $match: {
            user: user._id,
            type: 'credit',
            category:
              'MaturityReturn',
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$amount',
            },
          },
        },
      ]),

      WalletTransaction.find({
        user: userId,
      })
        .select(
          [
            'type',
            'category',
            'amount',
            'description',
            'createdBy',
            'createdAt',
          ].join(' '),
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),

      Payment.find({
        user: userId,
      })
        .populate(
          'plan',
          'title',
        )
        .select(
          [
            'plan',
            'amount',
            'method',
            'status',
            'createdAt',
          ].join(' '),
        )
        .sort({
          createdAt: -1,
        })
        .limit(3),
    ]);
    
    console.log('Dashboard userId:', userId);

    console.log(
      'Subscriptions found:',
      JSON.stringify(
        currentSubscriptions,
        null,
        2,
      ),
    );

    const pendingReturn =
      pendingReturnResult.length > 0
        ? Number(
            pendingReturnResult[0]
              .total || 0,
          )
        : 0;

    const pendingReturnCount =
      pendingReturnResult.length > 0
        ? Number(
            pendingReturnResult[0]
              .count || 0,
          )
        : 0;

    const totalMaturityReturn =
      maturityReturnResult.length > 0
        ? Number(
            maturityReturnResult[0]
              .total || 0,
          )
        : 0;

    // Added logs right before returning the JSON response
    console.log("========== DASHBOARD RESPONSE ==========");
    console.log(
      JSON.stringify(
        {
          subscriptions: currentSubscriptions,
        },
        null,
        2,
      ),
    );
    console.log("========================================");

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
          balance:
            Number(user.walletBalance) ||
            0,

          pendingReturn,
          pendingReturnCount,
          totalMaturityReturn,
        },

        subscriptions: currentSubscriptions.map(
          subscription => {
            let daysRemaining = 0;

            if (subscription.endDate) {
              daysRemaining = Math.max(
                0,
                Math.ceil(
                  (
                    new Date(
                      subscription.endDate,
                    ).getTime() -
                    now.getTime()
                  ) /
                    (1000 * 60 * 60 * 24),
                ),
              );
            }

            return {
              id: subscription._id.toString(),

              plan: subscription.plan,

              startDate:
                subscription.startDate || null,

              endDate:
                subscription.endDate || null,

              status:
                subscription.status || 'Active',

              amountPaid:
                Number(
                  subscription.amountPaid,
                ) || 0,

              returnAmount:
                Number(
                  subscription.returnAmount,
                ) || 0,

              paymentMethod:
                subscription.paymentMethod ||
                'Wallet',

              paymentStatus:
                subscription.paymentStatus ||
                'Paid',

              returnStatus:
                subscription.returnStatus ||
                'Pending',

              daysRemaining,
            };
          },
        ),
        recentTransactions,
        recentPayments,
      },
    });
  } catch (error) {
    console.error(
      'Dashboard error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load dashboard',
    });
  }
};

module.exports = {
  dashboard,
  getUserDashboard,
};