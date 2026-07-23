const mongoose = require('mongoose');

const Subscription = require(
  '../models/Subscription',
);

const {
  processSubscriptionReturn,
} = require(
  '../services/maturityService',
);

const getReturnSummary = async (
  req,
  res,
) => {
  try {
    const now = new Date();

    const summaryResult =
      await Subscription.aggregate([
        {
          $facet: {
            pending: [
              {
                $match: {
                  returnStatus:
                    'Pending',
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                  amount: {
                    $sum:
                      '$returnAmount',
                  },
                },
              },
            ],

            processing: [
              {
                $match: {
                  returnStatus:
                    'Processing',
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                  amount: {
                    $sum:
                      '$returnAmount',
                  },
                },
              },
            ],

            failed: [
              {
                $match: {
                  returnStatus:
                    'Failed',
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                  amount: {
                    $sum:
                      '$returnAmount',
                  },
                },
              },
            ],

            credited: [
              {
                $match: {
                  returnStatus:
                    'Credited',
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                  amount: {
                    $sum:
                      '$returnAmount',
                  },
                },
              },
            ],

            overdue: [
              {
                $match: {
                  endDate: {
                    $lt: now,
                  },

                  returnStatus: {
                    $in: [
                      'Pending',
                      'Processing',
                      'Failed',
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                  amount: {
                    $sum:
                      '$returnAmount',
                  },
                },
              },
            ],
          },
        },
      ]);

    const result =
      summaryResult[0] || {};

    const normalize = value => ({
      count:
        value?.[0]?.count || 0,

      amount:
        value?.[0]?.amount || 0,
    });

    return res.status(200).json({
      success: true,

      summary: {
        pending: normalize(
          result.pending,
        ),

        processing: normalize(
          result.processing,
        ),

        failed: normalize(
          result.failed,
        ),

        credited: normalize(
          result.credited,
        ),

        overdue: normalize(
          result.overdue,
        ),
      },
    });
  } catch (error) {
    console.error(
      'Return summary error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load return summary',
    });
  }
};

const getPendingReturns = async (
  req,
  res,
) => {
  try {
    const {
      status = 'all',
      search = '',
      page = 1,
      limit = 20,
    } = req.query;

    const safePage = Math.max(
      Number(page) || 1,
      1,
    );

    const safeLimit = Math.min(
      Math.max(
        Number(limit) || 20,
        1,
      ),
      100,
    );

    const filter = {};

    if (
      status &&
      status !== 'all'
    ) {
      filter.returnStatus =
        status;
    } else {
      filter.returnStatus = {
        $in: [
          'Pending',
          'Processing',
          'Failed',
          'Credited',
        ],
      };
    }

    let userIds = null;

    if (search.trim()) {
      const User = require(
        '../models/User',
      );

      const users =
        await User.find({
          $or: [
            {
              fullName: {
                $regex:
                  search.trim(),

                $options: 'i',
              },
            },
            {
              email: {
                $regex:
                  search.trim(),

                $options: 'i',
              },
            },
          ],
        }).select('_id');

      userIds = users.map(
        user => user._id,
      );

      filter.user = {
        $in: userIds,
      };
    }

    const [
      subscriptions,
      total,
    ] = await Promise.all([
      Subscription.find(filter)
        .populate(
          'user',
          'fullName email mobile walletBalance',
        )
        .populate(
          'plan',
          'title price duration returnAmount',
        )
        .sort({
          endDate: 1,
        })
        .skip(
          (safePage - 1) *
            safeLimit,
        )
        .limit(safeLimit),

      Subscription.countDocuments(
        filter,
      ),
    ]);

    const now = Date.now();

    const returns =
      subscriptions.map(
        subscription => {
          const endTime =
            new Date(
              subscription.endDate,
            ).getTime();

          const overdueDays =
            endTime < now
              ? Math.floor(
                  (now - endTime) /
                    (
                      1000 *
                      60 *
                      60 *
                      24
                    ),
                )
              : 0;

          return {
            ...subscription.toObject(),
            overdueDays,
          };
        },
      );

    return res.status(200).json({
      success: true,
      returns,

      pagination: {
        page: safePage,
        limit: safeLimit,
        total,

        totalPages: Math.ceil(
          total / safeLimit,
        ),
      },
    });
  } catch (error) {
    console.error(
      'Admin returns error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to load returns',
    });
  }
};

const processSingleReturn = async (
  req,
  res,
) => {
  try {
    const {
      subscriptionId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        subscriptionId,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid subscription ID',
      });
    }

    const subscription =
      await Subscription.findById(
        subscriptionId,
      );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message:
          'Subscription not found',
      });
    }

    if (
      new Date(
        subscription.endDate,
      ) > new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Subscription has not matured yet',
      });
    }

    if (
      subscription.returnStatus ===
      'Credited'
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Return is already credited',
      });
    }

    const processed =
      await processSubscriptionReturn(
        subscriptionId,
      );

    await processed.populate(
      'user',
      'fullName email walletBalance',
    );

    await processed.populate(
      'plan',
      'title price duration returnAmount',
    );

    return res.status(200).json({
      success: true,
      message:
        'Return processed successfully',
      subscription: processed,
    });
  } catch (error) {
    console.error(
      'Manual return error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to process return',
    });
  }
};

const retryFailedReturn = async (
  req,
  res,
) => {
  try {
    const {
      subscriptionId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        subscriptionId,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid subscription ID',
      });
    }

    const subscription =
      await Subscription.findOne({
        _id: subscriptionId,
        returnStatus: 'Failed',
      });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message:
          'Failed return not found',
      });
    }

    subscription.returnStatus =
      'Pending';

    subscription.returnFailureReason =
      '';

    await subscription.save();

    const processed =
      await processSubscriptionReturn(
        subscriptionId,
      );

    return res.status(200).json({
      success: true,
      message:
        'Return retry completed',
      subscription: processed,
    });
  } catch (error) {
    console.error(
      'Return retry error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to retry return',
    });
  }
};

module.exports = {
  getReturnSummary,
  getPendingReturns,
  processSingleReturn,
  retryFailedReturn,
};