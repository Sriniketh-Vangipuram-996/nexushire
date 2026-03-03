import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import { registerRecurringJobs } from "./queues/registerRecurringJobs";
import http from "http";
import { initSocket } from "./socket";
import { connectPubSub, subscriber } from "./utils/redisPubSub";
import { getIO } from "./socket";
import Notification from "./models/Notification";
import { logger } from "./utils/logger";
import { setupQueueDashboard } from "./queues/queueMonitor";


const PORT = process.env.PORT || 5000;
const isTest=process.env.NODE_ENV==="test";
async function start() {

  if(isTest)return;//Dont start server in tests
  try {
    await connectDB();
    logger.info("✅ MongoDB connected");
    const server = http.createServer(app);
    //Server tries to listen to events by subscribing to redis
    logger.info("Connecting to Redis...");
    await connectRedis();
    logger.info("Redis connected");
    logger.info("Initializing socket server");
    await initSocket(server);
    logger.info("Done initializing socket server");

    //New socket exists
    await connectPubSub();
    logger.info("Redis Pub/Sub connected.");

    // Subscribe first
await subscriber.subscribe("notifications");
await subscriber.subscribe("admin_alerts");

// Global message listener
subscriber.on("message", async (channel: string, message: string) => {
  const data = JSON.parse(message);

  if (channel === "notifications") {
    logger.info("Notification received from worker:", data);

    const notification = await Notification.create({
      user: data.userId,
      type: data.type,
      message: data.message,
    });

    const unreadCount = await Notification.countDocuments({
      user: data.userId,
      isRead: false,
    });

    getIO().to(data.userId).emit("notification", {
      notification,
      unreadCount,
    });
  }

  if (channel === "admin_alerts") {
    logger.info("Admin alert:", data);
    getIO().to("admin-room").emit("admin-alert", data);
  }
});

    await registerRecurringJobs()
      .then(() => console.log("✅ Recurring jobs registered"))
      .catch(err => console.error("Recurring jobs error:", err));

      setupQueueDashboard(app);

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    logger.info("❌ Failed to start server:");
    logger.error(error);
    process.exit(1);
  }
}

if(!isTest){
  start();
}
