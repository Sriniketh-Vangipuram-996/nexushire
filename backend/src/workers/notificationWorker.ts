import {Worker} from "bullmq";
import Notification from "../models/Notification";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import IORedis from "ioredis";

dotenv.config();


const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});


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

    {connection}
);