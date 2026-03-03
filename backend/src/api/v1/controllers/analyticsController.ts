import { Request, Response } from "express";
import mongoose from "mongoose";
import JobApplication from "../../../models/JobApplication";
import { logger } from "../../../utils/logger";

export const getDashboardAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);
    const {range="all",role}=req.query;

    let dateFilter:Record<string,any>={};

    if(range==="3m"){
      const date=new Date();
      date.setMonth(date.getMonth()-3);
      dateFilter={appliedDate:{$gte:date}};
    }

    if(range==="6m"){
      const date=new Date();
      date.setMonth(date.getMonth()-6);
      dateFilter={appliedDate:{$gte:date}};
    }

    const roleFilter = role
      ? { role: { $regex: new RegExp(`^${role}$`, "i") } } // i = ignore case
      : {};

    const matchFilter={
      user:userId,
      ...dateFilter,
      ...roleFilter,
    };

    //Status count
    const statusCounts=await JobApplication.aggregate([
      {$match:matchFilter},
      {
        $group:{
          _id:"$status",
          count:{$sum:1},
        },
      },
    ]);
    
    // 1️⃣ Application Trend
    const applicationTrend = await JobApplication.aggregate([
      { $match:  matchFilter  },
      {
        $group: {
          _id: {
            year: { $year: "$appliedDate" },
            month: { $month: "$appliedDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 2️⃣ Success Rate by Role
    const successRateByRole = await JobApplication.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$role",
          total: { $sum: 1 },
          interviews: {
            $sum: {
              $cond: [{ $eq: ["$status", "Interview"] }, 1, 0],
            },
          },
          offers: {
            $sum: {
              $cond: [{ $eq: ["$status", "Offer"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 3️⃣ Skill Gaps
    const skillGaps = await JobApplication.aggregate([
      { $match: matchFilter},
      { $unwind: "$comparisons" },
      { $unwind: "$comparisons.missingSkills" },
      {
        $group: {
          _id: "$comparisons.missingSkills",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const aiInsights=await JobApplication.aggregate([
      {$match:matchFilter},
      {$unwind:"$comparisons"},
      {$unwind:"$comparisons.suggestions"},

      {
        $group:{
          _id:"$comparisons.suggestions",
          count:{$sum:1},
        },
      },

      {$sort:{count:-1}},
      {$limit:5},

    ]);

    res.json({
      statusCounts,
      applicationTrend,
      successRateByRole,
      skillGaps,
      aiInsights,
    });
  } catch (error) {
    req.log?.error(error);
    res.status(500).json({ message: "Analytics failed" });
  }
};
