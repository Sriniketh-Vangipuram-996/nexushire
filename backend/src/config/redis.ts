import Redis from "ioredis";
import { logger } from "../utils/logger";

const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  logger.info("Connected to Redis");
});

redisConnection.on("error", (err) => {
  logger.error("Redis Error:");
  logger.error(err);
});

export const connectRedis = async () => {
  await redisConnection.ping();
};

export default redisConnection;