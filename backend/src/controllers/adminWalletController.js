const mongoose = require('mongoose');

const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Subscription = require(
  '../models/Subscription',
);
const validateAmount = amount => {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    return null;
  }

  return numericAmount;
};

// Admin: Credit user wallet
const creditWallet = async (req, res) => {
  try {
    const {amount, description} = req.body;
    const numericAmount = validateAmount(amount);

    if (!numericAmount) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid credit amount',
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(
      req.params.id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.walletBalance =
      Number(user.walletBalance || 0) +
      numericAmount;

    await user.save();

    const transaction =
    await WalletTransaction.create({
      user: user._id,
      type: 'credit',
      category: 'AdminCredit',
      amount: numericAmount,
      description:
      description?.trim() ||
      'Wallet credited by admin',
      createdBy: 'Admin',
    });

    return res.status(200).json({
      success: true,
      message: 'Wallet credited successfully',
      balance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.error(
      'Credit wallet error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to credit wallet',
    });
  }
};

// Admin: Debit user wallet
const debitWallet = async (req, res) => {
  try {
    const {amount, description} = req.body;
    const numericAmount = validateAmount(amount);

    if (!numericAmount) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid debit amount',
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(
      req.params.id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (
      Number(user.walletBalance || 0) <
      numericAmount
    ) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
      });
    }

    user.walletBalance =
      Number(user.walletBalance || 0) -
      numericAmount;

    await user.save();

    const transaction =
     await WalletTransaction.create({
      user: user._id,
      type: 'debit',
      category: 'AdminDebit',
      amount: numericAmount,
      description:
       description?.trim() ||
       'Wallet debited by admin',
      createdBy: 'Admin',
    });

    return res.status(200).json({
      success: true,
      message: 'Wallet debited successfully',
      balance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.error(
      'Debit wallet error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to debit wallet',
    });
  }
};

// Admin: View wallet by user ID
const getWallet = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await User.findById(
      req.params.id,
    ).select(
      'fullName email mobile walletBalance',
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const transactions =
      await WalletTransaction.find({
        user: user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      wallet: user,
      transactions,
    });
  } catch (error) {
    console.error(
      'Get admin wallet error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to load wallet',
    });
  }
};

// Mobile: Logged-in user's wallet summary
const getMyWalletSummary = async (
  req,
  res,
) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(
      userId,
    ).select(
      'fullName email walletBalance',
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const todayStart = new Date();

    todayStart.setHours(
      0,
      0,
      0,
      0,
    );

    const todayEnd = new Date();

    todayEnd.setHours(
      23,
      59,
      59,
      999,
    );

    const [
      totalCreditResult,
      totalDebitResult,
      todayCreditResult,
      todayDebitResult,
      pendingReturnResult,
      creditedReturnResult,
    ] = await Promise.all([
      WalletTransaction.aggregate([
        {
          $match: {
            user: user._id,
            type: 'credit',
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

      WalletTransaction.aggregate([
        {
          $match: {
            user: user._id,
            type: 'debit',
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

      WalletTransaction.aggregate([
        {
          $match: {
            user: user._id,
            type: 'credit',
            createdAt: {
              $gte: todayStart,
              $lte: todayEnd,
            },
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

      WalletTransaction.aggregate([
        {
          $match: {
            user: user._id,
            type: 'debit',
            createdAt: {
              $gte: todayStart,
              $lte: todayEnd,
            },
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
    ]);

    const getTotal = result =>
      result.length > 0
        ? Number(result[0].total || 0)
        : 0;

    return res.status(200).json({
      success: true,

      summary: {
        balance:
          Number(user.walletBalance) || 0,

        totalCredit:
          getTotal(totalCreditResult),

        totalDebit:
          getTotal(totalDebitResult),

        todayCredit:
          getTotal(todayCreditResult),

        todayDebit:
          getTotal(todayDebitResult),

        pendingReturn:
          getTotal(pendingReturnResult),

        pendingReturnCount:
          pendingReturnResult.length > 0
            ? Number(
                pendingReturnResult[0]
                  .count || 0,
              )
            : 0,

        totalMaturityReturn:
          getTotal(creditedReturnResult),
      },
    });
  } catch (error) {
    console.error(
      'Wallet summary error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load wallet summary',
    });
  }
};

// Mobile: Logged-in user's transactions
const getMyTransactions = async (
  req,
  res,
) => {
  try {
    const userId = req.user.id;

    const transactions =
  await WalletTransaction.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .select(
      [
        'type',
        'category',
        'amount',
        'description',
        'createdBy',
        'subscription',
        'referenceId',
        'createdAt',
      ].join(' '),
    )
    .limit(100);

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(
      'Wallet transactions error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load wallet transactions',
    });
  }
};

module.exports = {
  creditWallet,
  debitWallet,
  getWallet,
  getMyWalletSummary,
  getMyTransactions,
};