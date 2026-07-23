const mongoose = require('mongoose');

const Subscription = require(
  '../models/Subscription',
);

const User = require(
  '../models/User',
);

const WalletTransaction = require(
  '../models/WalletTransaction',
);

const {
  sendNotification,
} = require(
  '../services/notificationService',
);

const processSubscriptionReturn = async (
  subscriptionId,
) => {
  const session =
    await mongoose.startSession();

  let creditNotification = null;

  try {
    let processedSubscription = null;

    await session.withTransaction(
      async () => {
        const subscription =
          await Subscription.findOneAndUpdate(
            {
              _id: subscriptionId,

              returnStatus: {
                $in: [
                  'Pending',
                  'Failed',
                ],
              },

              endDate: {
                $lte: new Date(),
              },
            },
            {
              $set: {
                returnStatus:
                  'Processing',

                returnFailureReason: '',
              },
            },
            {
              new: true,
              session,
            },
          );

        if (!subscription) {
          throw new Error(
            'Subscription is not eligible for return processing',
          );
        }

        const returnAmount = Number(
          subscription.returnAmount || 0,
        );

        if (
          !Number.isFinite(returnAmount) ||
          returnAmount <= 0
        ) {
          subscription.status =
            'Expired';

          subscription.returnStatus =
            'NotApplicable';

          await subscription.save({
            session,
          });

          processedSubscription =
            subscription;

          return;
        }

        const referenceId =
          `MATURITY_${subscription._id}`;

        const existingTransaction =
          await WalletTransaction.findOne({
            referenceId,
          }).session(session);

        if (existingTransaction) {
          subscription.status =
            'Expired';

          subscription.returnStatus =
            'Credited';

          subscription.returnCreditedAt =
            existingTransaction.createdAt ||
            new Date();

          subscription.returnTransaction =
            existingTransaction._id;

          await subscription.save({
            session,
          });

          processedSubscription =
            subscription;

          return;
        }

        const updatedUser =
          await User.findByIdAndUpdate(
            subscription.user,
            {
              $inc: {
                walletBalance:
                  returnAmount,
              },
            },
            {
              new: true,
              session,
            },
          );

        if (!updatedUser) {
          throw new Error(
            'User not found',
          );
        }

        const transactions =
          await WalletTransaction.create(
            [
              {
                user:
                  subscription.user,

                type: 'credit',

                category:
                  'MaturityReturn',

                amount:
                  returnAmount,

                description:
                  'Subscription maturity return credited',

                createdBy:
                  'System',

                subscription:
                  subscription._id,

                referenceId,
              },
            ],
            {
              session,
            },
          );

        const walletTransaction =
          transactions[0];

        subscription.status =
          'Expired';

        subscription.returnStatus =
          'Credited';

        subscription.returnCreditedAt =
          new Date();

        subscription.returnTransaction =
          walletTransaction._id;

        subscription.returnFailureReason =
          '';

        await subscription.save({
          session,
        });

        processedSubscription =
          subscription;

        /*
         * Only queue a "credited" notification for a real,
         * fresh wallet credit — not for the dedup / not-applicable
         * paths above. Actually sending it happens after the
         * transaction commits, so a notification failure can
         * never roll back a successful credit.
         */
        creditNotification = {
          user: subscription.user,
          amount: returnAmount,
        };
      },
    );

    if (creditNotification) {
      try {
        await sendNotification({
          user: creditNotification.user,
          title: 'Return Credited',
          message: `₹${creditNotification.amount} credited to your wallet.`,
          type: 'Return',
          action: 'Wallet',
        });
      } catch (notifyError) {
        console.error(
          'Failed to send return-credited notification:',
          notifyError.message,
        );
      }
    }

    return processedSubscription;
  } catch (error) {
    const failedSubscription =
      await Subscription.findOneAndUpdate(
        {
          _id: subscriptionId,

          returnStatus: {
            $ne: 'Credited',
          },
        },
        {
          $set: {
            returnStatus: 'Failed',

            returnFailureReason:
              error.message ||
              'Return processing failed',
          },
        },
      );

    if (failedSubscription) {
      try {
        await sendNotification({
          user: failedSubscription.user,
          title: 'Return Failed',
          message:
            'Your maturity return failed. We are retrying.',
          type: 'Return',
        });
      } catch (notifyError) {
        console.error(
          'Failed to send return-failed notification:',
          notifyError.message,
        );
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const processMaturedSubscriptions =
  async () => {
    const maturedSubscriptions =
      await Subscription.find({
        status: 'Active',

        endDate: {
          $lte: new Date(),
        },

        returnStatus: {
          $in: [
            'Pending',
            'Failed',
          ],
        },
      })
        .select('_id')
        .limit(100);

    const results = {
      processed: 0,
      failed: 0,
    };

    for (
      const subscription of
      maturedSubscriptions
    ) {
      try {
        await processSubscriptionReturn(
          subscription._id,
        );

        results.processed += 1;
      } catch (error) {
        results.failed += 1;

        console.error(
          `Maturity processing failed for ${subscription._id}:`,
          error.message,
        );
      }
    }

    return results;
  };

module.exports = {
  processSubscriptionReturn,
  processMaturedSubscriptions,
};