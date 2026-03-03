import { emailQueue } from "./emailQueue";
import { logger } from "../common/utils/logger";

export const registerRecurringJobs = async () => {
  try {
    // Check if job already exists
    const existingJobs = await emailQueue.getRepeatableJobs();
    const jobExists = existingJobs.some(j => j.id === "weekly-summary-job");

    if (jobExists) {
      logger.info("🔁 Weekly summary job already registered");
      return;
    }

    // Add recurring job
    await emailQueue.add(
      "weeklySummary",
      {}, // job data
      {
        repeat: {
          pattern: "0 9 * * 0", // Sunday 9AM
        },
        jobId: "weekly-summary-job", // prevents duplicates
        removeOnComplete: true,      // optional: cleans up completed jobs
      }
    );

    logger.info("✅ Weekly summary cron registered");
  } catch (err) {
    logger.info("❌ Failed to register weekly summary cron:");
    logger.error(err);
    throw err; // propagate to server startup if needed
  }
};