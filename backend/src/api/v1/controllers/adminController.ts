import { Request, Response } from "express";
import User from "../../../models/User";
import JobApplication from "../../../models/JobApplication";
import Event from "../../../models/Event";
import Reminder from "../../../models/Reminder";
import { emailQueue } from "../../../queues/emailQueue";
import { scopedQuery } from "../../../utils/scopedQuery";
import { id } from "zod/locales";
import { AuthRequest } from "../../../middleware/auth";
import { logger } from "../../../utils/logger";
import AuditLog from "../../../models/AuditLog";


export const getUserDetails = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");
  const jobs = await JobApplication.find({ user: req.params.id });

  res.json({ user, jobs });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-password");

  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  await User.findOneAndUpdate({id:req.params.id,...scopedQuery(req)},{isDeleted:true});
  await JobApplication.deleteMany({ user: req.params.id });
  await Event.deleteMany({ user: req.params.id });

  res.json({ message: "User deleted" });
};

export const downloadUserAnalytics = async (
  req: Request,
  res: Response
) => {
  const jobs = await JobApplication.find({ user: req.params.id });

  const statusCounts = jobs.reduce((acc: any, job: any) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalJobs: jobs.length,
    statusCounts,
  });
};

export const getPlatformStats = async (req:Request, res:Response) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const totalJobs = await JobApplication.countDocuments();
  const totalEvents = await Event.countDocuments();

  const eventBreakdown = await Event.aggregate([
    {
      $group: {
        _id: "$eventType",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json({
    totalUsers,
    activeUsers,
    totalJobs,
    totalEvents,
    eventBreakdown,
  });
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, search = "" } = req.query;
    const limit = 10;
     const searchTerm=typeof search==="string"?search:"";
    // Only fetch regular users for admin dashboard
    const users = await User.find({ role: "user", name: { $regex: searchTerm, $options: "i" },...scopedQuery(req) })
      .select("-passwordHash")
      .skip((+page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({ role: "user" });

    res.json({ users, total });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const toggleUserStatus = async (req:Request, res:Response) => {
  const user = await User.findById(req.params.id);
  if(!user){
    return res.status(404).json({error:"User not found."});
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json(user);
};

export const getReminderAnalytics=async(req:Request,res:Response)=>{
  const stats=await Reminder.aggregate([
    {
      $group:{
        _id:null,
        totalReminders:{$sum:1},
        sent:{
          $sum:{$cond:[{$eq:["$status","sent"]},1,0]},
        },
        failed:{
          $sum:{$cond:[{$eq:["$status","failed"]},1,0]},
        },
        converted:{
          $sum:{$cond:["$isConverted",1,0]},
        }
      }
    }
  ]);

  const result=stats[0]|| {};

  const successRate=result.sent>0?((result.converted/result.sent)*100).toFixed(2):0;
  res.json({
    ...result,
    successRate:`${successRate}%`,
  });
}

export const getFailedRemminders=async(req:Request,res:Response)=>{
  const failed=await Reminder.find({status:"failed"})
    .populate("user","name email")
    .populate("job","companyName role")
    .sort({failedAt:-1});

  res.json(failed);
};

export const retryReminder=async(req:Request,res:Response)=>{
  const reminder=await Reminder.findById(req.params.id);

  if(!reminder || reminder.status!=="failed"){
    return res.status(400).json({message:"Invalid Reminder."});
  }

  const job=await emailQueue.add(
    "jobReminder",
    {
      reminderId:reminder._id,
    }
  );

  reminder.status="scheduled";
  reminder.failedAt=null;
  reminder.failureReason=null;
  reminder.retryCount+=1;
  reminder.bullJobId=job.id;

  await reminder.save();

  res.json({message:"Retry Scheduled"});
}

export const getReminderHealthStats=async(req:Request,res:Response)=>{
  const stats=await Reminder.aggregate([
    {
      $group:{
        _id:null,
        total:{$sum:1},
        failed:{
          $sum:{$cond:[{$eq:["$status","failed"]},1,0]},
        },
        sent:{
          $sum:{$cond:[{$eq:["$status","sent"]},1,0]},
        },
        totalRetries:{$sum:"$retryCount"},
      },
    },
  ]);

  res.json(stats[0]|| {});
}

export const recoverUser=async(req:AuthRequest,res:Response)=>{
  const user=await User.findOneAndUpdate({
    _id:req.params.id,
    tenantId:req.tenantId,
  },
  {
    isDeleted:false,
  },
  {new:true}
);
res.json(user);
};

export const getAuditLogs=async(req:Request,res:Response)=>{
  try{
    const {
      page=1,
      limit=20,
      action,
      actorId,
      from,
      to,
    }=req.query;

    const filter:any={};

    if(action) filter.action=action;
    if(actorId)filter.actorId=actorId;

    if(from || to){
      filter.createdAt={};

      if(from) filter.createdAt.$gte=new Date(from as string);
      if(to) filter.createdAt.$lte=new Date(to as string);
    }

    const pageNumber=Number(page);
    const limitNumber=Number(limit);
    const skip=(pageNumber-1)*limitNumber;
    const[logs,total]=await Promise.all([
      AuditLog.find(filter)
              .sort({createdAt:-1})
              .skip(skip)
              .limit(limitNumber),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      data:logs,
      pagination:{
        total,
        page:pageNumber,
        limit:limitNumber,
        totalPages:Math.ceil(total/limitNumber),
      }
    });
  }

  catch(error:any){
    req.log?.error({error:error.message,stack:error.stack},"Failed to fetch audit logs");

    res.status(500).json({
      message:"Failed to fetch audit logs."
    });
  }
}