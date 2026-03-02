import {Worker} from "bullmq";
import Notification from "../models/Notification";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();
new Worker(
    "notificationQueue",
    async(job)=>{
        const{userId,message,type}=job.data;

        await Notification.create({
            user:userId,
            message,
            type,
        });

        logger.info("Notification Saved:",message);
    },

    {connection:{
        host:process.env.REDIS_HOST!,
        port:Number(process.env.REDIS_PORT!),
    }}
);