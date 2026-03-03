import { Request, Response } from "express";
import JobApplication from "../common/models/JobApplication";
import mongoose from "mongoose";
import Resume from "../common/models/Resume";
import { trackEvent } from "../common/utils/trackEvent";
import { emailQueue } from "../queues/emailQueue";
import Reminder from "../common/models/Reminder";
import User from "../common/models/User";
import { extractResumeText } from "../common/utils/extractResumeText";
import { publisher } from "../common/utils/redisPubSub";
import { logger } from "../common/utils/logger";

export const createJobApplication = async (req: Request, res: Response) => {
  try {
    const { companyName, role, description, status, appliedDate, notes } = req.body;

    if (!companyName || !role) {
      return res.status(400).json({ error: "Company name and role are required" });
    }
    if (!req.user) return res.status(401).json({ error: "UnAuthorized" });

    const user=await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    const job = await JobApplication.create({
      companyName,
      role,
      description,
      status,
      appliedDate,
      notes,
      user: req.user.userId,
    });

    // Track event
    await trackEvent(req.user.userId, "Job Created", { jobId: job._id, companyName, role });

    if(job.status==="Applied"){
      const exisitngReminder=await Reminder.findOne({
        user:req.user.userId,
        job:job._id,
        status:"scheduled",
      });

      if(!exisitngReminder){
      const followUpDate=new Date();
      followUpDate.setDate(followUpDate.getDate()+3);

      //1] create reminder in DB first
      const reminder=await Reminder.create({
        user:req.user.userId,
        job:job._id,
        email:user.email,
        reminderDate:followUpDate,
        status:"scheduled",
        bullJobId:"temp",
      });

      //2] now add it to queue
      const bullJob=await emailQueue.add(
        "autoFollowUp",
        {
          to:user.email,
          jobTitle:job.role,
          company:job.companyName,
          reminderId:reminder._id.toString(),
          userId:req.user.userId.toString(),
          requestId:req.requestId,
        },
        {
          delay:10*1000
        }
      );
    reminder.bullJobId=bullJob.id!;
    await reminder.save();
    }
  }
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to create job application" });
  }
};

export const getMyJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const jobs = await JobApplication.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch job applications.",
    });
  }
};

export const getJobById=async(req:Request,res:Response)=>{
  try{
    const {id}=req.params;

    //Validate ObjectId
    if(!mongoose.Types.ObjectId.isValid(id.toString())){
      return res.status(400).json({
        error:"Invalid Job ID",
      });
    }

    const job=await JobApplication.findOne({
      _id:id,
      user:req.user?.userId, //owner ship check.
    })
    .populate("resume")
    .populate("comparisons.resume");

    if(!job){
      return res.status(404).json({
        error:"Job not found.",
      });
    }
    res.json(job);
  }
  catch(err){
    res.status(500).json({
      error:"Failed to fetch job",
    });
  }
}

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["Applied", "Interviewed", "Offer", "Rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const job = await JobApplication.findOneAndUpdate(
      { _id: id, user: req.user?.userId },
      { status },
      { returnDocument: "after" }
    );

    if (!job) return res.status(404).json({ error: "Job Not Found" });

    // Track event
    await trackEvent(req.user!.userId, "Job Status Updated", { jobId: job._id, status });
    if (status === "Applied") {
      const existingReminder = await Reminder.findOne({
        user: req.user!.userId,
        job: job._id,
        status: "scheduled",
    });

    if(status==="Interviewed" || status==="Offer"){
      await Reminder.updateMany(
        {
          job:job._id,
          status:"sent",
        },
        {
          isConverted:true,
          convertedAt:new Date(),
        }
      )
    }

  if (!existingReminder) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 3);

    const delay = followUpDate.getTime() - Date.now();

    const reminder = await Reminder.create({
      user: req.user!.userId,
      job: job._id,
      email: req.user!.email,
      reminderDate: followUpDate,
      status: "scheduled",
      bullJobId: "temp",
    });

    const bullJob = await emailQueue.add(
      "autoFollowUp",
      {
        to: req.user!.email,
        jobTitle: job.role,
        company: job.companyName,
        reminderId: reminder._id.toString(),
        userId: req.user!.userId.toString(),
        requestId:req.requestId,
      },
      { delay }
    );

    reminder.bullJobId = bullJob.id!;
    await reminder.save();
  }
}
//Auto Cancel when status changes
if(["Interviewed","Offer","Rejected"].includes(status)){
  const reminders=await Reminder.find({
    job:job._id,
    user:req.user?.userId,
    status:"scheduled",
  });

  for(const r of reminders){
    try{
      if(!r.bullJobId)return res.json({message:"No BullJobID detected"})
      const bullJob=await emailQueue.getJob(r.bullJobId);
      if(bullJob){
        await bullJob.remove();
      }

      r.status="cancelled";
      await r.save();
    }
    catch(error){
      req.log?.info("Failed to cancel reminder:");
      req.log?.error(error);
    }
  }
}
    res.json(job);
    await publisher.publish(
      "notifications",
      JSON.stringify({
        userId:req.user!.userId,
        type:"JOB_STATUS_UPDATED",
        message:`Status updatted to ${status} for ${job.companyName}`,
      })
    )
  } catch (err) {
    res.status(500).json({ error: "Failed to update job status" });
  }
};

export const deleteJobApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await JobApplication.findOneAndDelete({ _id: id, user: req.user?.userId });

    if (!job) return res.status(404).json({ error: "Job Not Found" });

    // Track event
    await trackEvent(req.user!.userId, "Job Deleted", { jobId: job._id });

    res.json({ message: "Job Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};

export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { jobIds, status } = req.body;

    req.log?.info("Bulk update request:", req.body, "user:", req.user?.userId);

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ error: "No jobs selected" });
    }

    // Validate IDs
    if (!jobIds.every((id: string) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: "Invalid job IDs" });
    }

    const validStatuses = ["Applied", "Interviewed", "Offer", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await JobApplication.updateMany(
      {
        _id: { $in: jobIds },
        user: req.user?.userId,
      },
      { $set: { status } }
    );

    req.log?.info("Bulk update result:");
    req.log?.info(result);

    res.json({ message: "Jobs updated successfully" });
  } catch (err) {
    req.log?.info("Bulk update failed:");
    req.log?.error(err);
    res.status(500).json({ error: "Bulk update failed" });
  }
};

export const bulkDeleteJobs = async (req: Request, res: Response) => {

  try {
    const { jobIds } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ error: "No jobs selected" });
    }

    await JobApplication.deleteMany({
      _id: { $in: jobIds },
      user: req.user?.userId,
    });

    await trackEvent(req.user!.userId,"Bulk Job Status Updated",{
      jobIds,
    });
    res.json({ message: "Jobs deleted successfully." });
  } catch (err) {
    req.log?.info("Bulk delete failed:");
    req.log?.error(err);
    res.status(500).json({ error: "Bulk delete failed." });
  }
};
export const attachResumeToJob = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { resumeId } = req.body;

    // Check if resume exists
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const job = await JobApplication.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.resume = resume._id;
    await job.save();

    const updatedJob = await JobApplication.findById(id).populate("resume");

    res.json(updatedJob);
  } catch (error) {
    req.log?.error(error);
    res.status(500).json({ message: "Failed to attach resume" });
  }
};

export const uploadResumeToJob = async (req: Request, res: Response) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found." });

    if (job.user.toString() !== req.user!.userId)
      return res.status(403).json({ error: "Unauthorized." });

    if (req.file) {
      const resumeDoc = await Resume.create({
        user: req.user!.userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        extractedText: await extractResumeText(req.file.path),
      });

      job.resume = resumeDoc._id;
      await job.save();

      return res.json({ resume: job.resume });
    } else {
      return res.status(400).json({ error: "No file uploaded." });
    }
  } catch (err) {
    req.log?.error(err);
    return res.status(500).json({ error: "Failed to upload resume" });
  }
};

export const deleteJobResume = async (req: Request, res: Response) => {
  try {
    const job = await JobApplication.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.user.toString() !== req.user!.userId)
      return res.status(403).json({ error: "Unauthorized" });

    job.resume = null;
    await job.save();

    return res.json({ message: "Job resume removed" });
  } catch (err) {
    req.log?.error(err);
    return res.status(500).json({ error: "Failed to remove resume" });
  }
};