const cron = require("node-cron");

const {
  processMaturedSubscriptions,
} = require(
  "../services/maturityService",
);

const startMaturityScheduler = () => {
  /*
   * Runs every hour at minute 0.
   *
   * Example:
   * 01:00, 02:00, 03:00...
   */
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        "[Maturity Scheduler] Started",
      );

      const result =
        await processMaturedSubscriptions();

      console.log(
        "[Maturity Scheduler] Completed:",
        result,
      );
    } catch (error) {
      console.error(
        "[Maturity Scheduler] Error:",
        error,
      );
    }
  });

  console.log(
    "Maturity scheduler is active",
  );
};

module.exports = startMaturityScheduler;