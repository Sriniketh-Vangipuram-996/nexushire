import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { logger } from "./common/utils/logger";

let io: Server;

export const initSocket = async (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

  // ✅ Use ioredis
  const pubClient = new Redis(redisUrl);
  const subClient = pubClient.duplicate();

  // ioredis auto-connects
  await pubClient.ping();
  await subClient.ping();

  io.adapter(createAdapter(pubClient as any, subClient as any));

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId as string;
    const userRole = socket.handshake.auth.userRole as string;

    if (!userId) {
      logger.info("Socket connected without userId");
      return;
    }

    if (userRole === "admin") {
      logger.info("Admin joined admin-room");
      socket.join("admin-room");
    }

    logger.info("User connected:");
    logger.info(userId);

    socket.join(userId);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};