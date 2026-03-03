import User from "../models/User";
import JobApplication from "../models/JobApplication";
import Reminder from "../models/Reminder";
import { transporter } from "../config/email";
import { weeklySummaryTemplate } from "../common/utils/weeklySummaryTemplate";
import { publisher } from "../common/utils/redisPubSub";
import { logger } from "../common/utils/logger";


type AppStats = {
  totalApplications: number;
  interviews: number;
  offers: number;
};

export const sendWeeklySummaries = async () => {
    logger.info("Starting weekly summary job...");

    //1] Get all users
    const users=await User.find({},"_id name email");
    if(!users.length)return;

    const userIds=users.map((u)=>u._id);

    //2] Aggregate application for ALL users at once
    const applicationStats=await JobApplication.aggregate([
        {$match:{user:{$in:userIds}}},
        {
            $group:{
                _id:{user:"$user",status:"$status"},
                count:{$sum:1},
            },
        },
    ]);

    //3] Aggregate reminders for ALL users
    const reminderStats=await Reminder.aggregate([
        {
            $match:{
                user:{$in:userIds},
                status:"scheduled",
            },
        },
        {
            $group:{
                _id:"$user",
                pendingFollowUps:{$sum:1},
            },
        },
    ]);

    //4] convert to lookup maps (o(1) access)
    const appMap: Record<string, AppStats> = {};
    const reminderMap: Record<string, number> = {};

    applicationStats.forEach((stat)=>{
        const userId=stat._id.user.toString();
        const status=stat._id.status;

        if(!appMap[userId]){
            appMap[userId]={
                totalApplications:0,
                interviews:0,
                offers:0,
            };
        }

        appMap[userId].totalApplications+=stat.count;

        if(status==="Interviewed"){
            appMap[userId].interviews=stat.count;
        }

        if(status==="Offer"){
            appMap[userId].offers=stat.count;
        }
    });

    reminderStats.forEach((stat)=>{
        reminderMap[stat._id.toString()]=stat.pendingFollowUps;
    })

    //5] send emails
    for (const user of users){
        const stats=appMap[user._id.toString()]||{
            totalApplications:0,
            interviews:0,
            offers:0,
        };

        const pendingFollowUps=reminderMap[user._id.toString()]||0;
        const html=weeklySummaryTemplate({
            name:user.name ?? "there",
            ...stats,
            pendingFollowUps,
        });

    await transporter.sendMail({
      from: `"NexusHire" <no-reply@nexushire.com>`,
      to: user.email,
      subject: "Your Weekly Career Summary",
      html,
    });

    await publisher.publish(
        "notifications",
        JSON.stringify({
            userId:user._id.toString(),
            type:"WEEKLY_SUMMARY_SENT",
            message:"Your weekly job summary has been delivered.",
        })

    )
  }

  logger.info("Weekly summaries completed");
};