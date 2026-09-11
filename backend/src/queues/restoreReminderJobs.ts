import Reminder from "../models/Reminder";
import JobApplication from "../models/JobApplication";
import { emailQueue } from "./emailQueue";

export const restoreReminderJobs = async () => {
  const reminders = await Reminder.find({
    status: "scheduled",
    reminderDate: { $gt: new Date() },
  }).populate("job");

  console.log(`Restoring ${reminders.length} reminder jobs...`);

  for (const reminder of reminders) {
    const existing = await emailQueue.getJob(reminder._id.toString());

    if (existing) continue;

    const job = reminder.job as any;

    const delay =
      new Date(reminder.reminderDate).getTime() - Date.now();

    if (delay <= 0) continue;

    await emailQueue.add(
      "sendReminder",
      {
        reminderId: reminder._id.toString(),
        userId: reminder.user.toString(),
        to: reminder.email,
        jobTitle: job.role,
        company: job.companyName,
      },
      {
        jobId: reminder._id.toString(),
        delay,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
      }
    );
  }

  console.log("Reminder restoration complete.");
};