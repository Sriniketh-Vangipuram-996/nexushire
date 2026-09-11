import { Request, Response } from "express";
import Reminder from "../../../models/Reminder";
import JobApplication from "../../../models/JobApplication";
import { emailQueue } from "../../../queues/emailQueue";
import { createAuditLog } from "../../../services/auditService";
import { deleteCacheByPattern } from "../../../utils/cache";


export const scheduleReminder = async (req: Request, res: Response) => {
  try {
    const { jobId, reminderDate } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const job=await JobApplication.findById(jobId);
    if(!job)return res.status(404).json({message:"Job not found."});

    const userId = req.user.userId;
    const userEmail = req.user.email;

    const delay = new Date(reminderDate).getTime() - Date.now();

    if (delay <= 0) {
      return res.status(400).json({ message: "Reminder date must be future" });
    }

    const reminder = await Reminder.create({
      user: userId,
      job: job._id,
      email: userEmail,
      reminderDate,
      status: "scheduled",
      bullJobId: "temp",
    });

    //Invalidate all reminder cache for user
    await deleteCacheByPattern(
      `nexushire:*:*:${req.user.tenantId}:${userId}:/reminders`
    )

    // scheduleReminder
    const bullJob = await emailQueue.add(
      "sendReminder",
      {
        reminderId: reminder._id.toString(),
        userId,
        to: userEmail,
        jobTitle: job.role,
        company: job.companyName,
      },
      {
        jobId: reminder._id.toString(), // unique & persistent
        delay,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    reminder.bullJobId = bullJob.id!;
    await reminder.save();

    await createAuditLog({
      actorId:req.user.userId,
      action:"REMINDER_CREATED",
      targetType:"Reminder",
      targetId:reminder._id.toString(),
      metadata:{
        jobTitle:job.role,
        company:job.companyName,
      },

      ip:req.ip,
      userAgent:req.headers["user-agent"],
      requestId:req.requestId,
    });

    res.json({ message: "Reminder scheduled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule reminder" });
  }
};


export const cancelRemainder=async(req:Request,res:Response)=>{
  console.log("🚨 CANCEL API HIT", req.params.id);
  const reminder=await Reminder.findById(req.params.id);
  if(!req.user){
    return res.status(401).json({message:"Unauthorized"});
  }
  if(!reminder){
    return res.status(404).json({message:"Not Found."});
  }

  if (reminder.bullJobId) {
      await emailQueue.remove(reminder.bullJobId);
  }

    reminder.status = "cancelled";
    await reminder.save();
    //Invalidate all reminder cache for user
    await deleteCacheByPattern(
      `nexushire:*:*:${req.user.tenantId}:${req.user.userId}:/reminders`
    )


    await createAuditLog({
        actorId: req.user.userId,
        action: "REMINDER_DELETED",
        targetType: "Reminder",
        targetId: reminder._id.toString(),
        requestId: req.requestId,
    });

    res.json({message:"Reminder cancelled."});
}

export const getUserReminders=async(req:Request,res:Response)=>{
  const reminders=await Reminder.find({
    user:req.user?.userId,
  }).populate("job");

  res.json(reminders);
}


export const snoozeReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    const reminder = await Reminder.findOne({
      _id: id,
      user: req.user?.userId,
    }).populate("job");

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (reminder.status !== "scheduled") {
      return res
        .status(400)
        .json({ message: "Only scheduled reminders can be snoozed" });
    }

    if (reminder.bullJobId) {
      await emailQueue.remove(reminder.bullJobId);
    }

    const delay = new Date(newDate).getTime() - Date.now();

    if (delay <= 0) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const jobData = reminder.job as any;

    const bullJob = await emailQueue.add(
      "sendReminder",
      {
        to: reminder.email,
        jobTitle: jobData.role,
        company: jobData.companyName,
        reminderId: reminder._id.toString(),
        userId: req.user!.userId,
      },
      {
        delay,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );

    reminder.reminderDate = new Date(newDate);
    reminder.bullJobId = bullJob.id!;
    await reminder.save();

    await deleteCacheByPattern(
      `nexushire:*:*:${req.user!.tenantId}:${req.user!.userId}:/reminders`
    );

    res.json({
      message: "Reminder snoozed successfully",
      reminder,
    });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ message: "Server error" });
  }
};