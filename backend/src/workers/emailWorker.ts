import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import { transporter } from "../config/email";
import Reminder from "../models/Reminder";
import Notification from "../models/Notification";
import { remainderTemplate } from "../utils/emailTemplates";
import { publisher } from "../utils/redisPubSub";
import connectDB from "../config/db";
import { logger } from "../utils/logger";
import { createAuditLog } from "../services/auditService";

interface ReminderJobData {
  to: string;
  jobTitle: string;
  company: string;
  reminderId: string;
  userId: string;
}

const redisConnection = {
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
};

async function startWorker() {
  try {
    logger.info({ redisConnection }, "Connecting to Redis");

    // 1️⃣ Connect MongoDB FIRST
    await connectDB();
    logger.info("Worker connected to MongoDB");

    // 2️⃣ Connect Redis publisher
    if (!publisher.status || publisher.status !== "ready") {
      await publisher.ping();
      logger.info("Worker Redis publisher connected");
    }

    // 3️⃣ Create Worker AFTER DB connection
    const emailWorker = new Worker(
      "emailQueue",
      async (job: Job<any>) => {
        logger.info(
          {
            jobName: job.name,
            jobId: job.id,
            requestId:job.data.requestId
          },
          "Processing job"
        );

        /* =======================================================
           🔹 JOB REMINDER
        ======================================================= */
        if (job.name === "jobReminder") {
          const { to, jobTitle, company, reminderId, userId } =
            job.data as ReminderJobData;

          const reminder = await Reminder.findById(reminderId);
          if (!reminder) {
            logger.warn({ reminderId }, "Reminder not found");
            throw new Error("Reminder not found");
          }

          try {
            await transporter.sendMail({
              from: `"NexusHire" <no-reply@nexushire.com>`,
              to,
              subject: `Follow up: ${jobTitle}`,
              html: remainderTemplate(jobTitle, company),
            });

            await Reminder.findByIdAndUpdate(reminderId, {
              status: "sent",
              sentAt: new Date(),
            });

            await Notification.create({
              user: userId,
              message: `Reminder email sent for ${jobTitle}`,
            });

            await createAuditLog({
                actorId: userId,
                action: "REMINDER_SENT",
                targetType: "Reminder",
                targetId: reminderId,
                metadata: { jobTitle },
                requestId: job.data.requestId,
            });
             

            await publisher.publish(
              "notifications",
              JSON.stringify({
                userId,
                type: "REMINDER_SENT",
                message: "Your job reminder was sent successfully.",
              })
            );

            logger.info(
              { reminderId, userId },
              "Reminder email sent successfully"
            );
          } catch (error: any) {
            await Reminder.findByIdAndUpdate(reminderId, {
              status: "failed",
              failedAt: new Date(),
              failureReason: error.message,
              lastTriedAt: new Date(),
              $inc: { retryCount: 1 },
            });

            await publisher.publish(
              "notifications",
              JSON.stringify({
                userId,
                type: "REMINDER_FAILED",
                message: "Your job reminder failed to send.",
              })
            );

            logger.error(
              {
                reminderId,
                userId,
                error: error.message,
                stack: error.stack,
              },
              "Reminder email failed"
            );

            throw error; // Required for BullMQ retry
          }
        }

        /* =======================================================
           🔹 AUTO FOLLOW UP
        ======================================================= */
        if (job.name === "autoFollowUp") {
          const { to, jobTitle, company, reminderId, userId } =
            job.data as ReminderJobData;

          const reminder = await Reminder.findById(reminderId);
          if (!reminder) {
            logger.warn({ reminderId }, "Reminder not found");
            throw new Error("Reminder not found");
          }

          try {
            await transporter.sendMail({
              from: `"NexusHire" <no-reply@nexushire.com>`,
              to,
              subject: `Auto Follow up: ${jobTitle}`,
              html: remainderTemplate(jobTitle, company),
            });

            await Reminder.findByIdAndUpdate(reminderId, {
              status: "sent",
              sentAt: new Date(),
            });

            await Notification.create({
              user: userId,
              message: `Auto follow-up email sent for ${jobTitle}`,
            });

            await publisher.publish(
              "notifications",
              JSON.stringify({
                userId,
                type: "AUTO_FOLLOWUP_SENT",
                message:
                  "Your auto follow-up email was sent successfully.",
              })
            );

            logger.info(
              { reminderId, userId },
              "Auto follow-up email sent successfully"
            );
          } catch (error: any) {
            await Reminder.findByIdAndUpdate(reminderId, {
              status: "failed",
              failedAt: new Date(),
              failureReason: error.message,
              lastTriedAt: new Date(),
              $inc: { retryCount: 1 },
            });

            await publisher.publish(
              "notifications",
              JSON.stringify({
                userId,
                type: "AUTO_FOLLOWUP_FAILED",
                message:
                  "Your auto follow-up email failed to send.",
              })
            );

            logger.error(
              {
                reminderId,
                userId,
                error: error.message,
                stack: error.stack,
              },
              "Auto follow-up email failed"
            );

            throw error;
          }
        }

        /* =======================================================
           🔹 WEEKLY SUMMARY
        ======================================================= */
        if (job.name === "weeklySummary") {
          try {
            const { sendWeeklySummaries } = await import(
              "../services/weeklySummaryService"
            );

            await sendWeeklySummaries();

            logger.info("Weekly summaries sent successfully");
          } catch (error: any) {
            logger.error(
              {
                error: error.message,
                stack: error.stack,
              },
              "Weekly summary failed"
            );
            throw error;
          }
        }
      },
      {
        connection: redisConnection,
        concurrency: 5,
      }
    );

    /* =======================================================
       🔹 Worker Event Listeners
    ======================================================= */

    emailWorker.on("completed", (job) => {
      logger.info(
        {
          jobId: job.id,
          jobName: job.name,
        },
        "Job completed"
      );
    });

    emailWorker.on("failed", async (job, err) => {
      await publisher.publish(
        "admin_alerts",
        JSON.stringify({
          type: "JOB_FAILED",
          message: `Job ${job?.name} failed`,
          jobId: job?.id,
          error: err.message,
        })
      );

      logger.error(
        {
          jobId: job?.id,
          jobName: job?.name,
          error: err.message,
        },
        "Job failed"
      );
    });

    emailWorker.on("error", (err) => {
      logger.error(
        {
          error: err.message,
          stack: err.stack,
        },
        "Worker runtime error"
      );
    });

    logger.info("Email worker started and listening for jobs");
  } catch (error: any) {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
      },
      "Worker failed to start"
    );
    process.exit(1);
  }
}

startWorker();