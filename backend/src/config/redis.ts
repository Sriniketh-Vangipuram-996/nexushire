import Redis from "ioredis";
import { logger } from "../common/utils/logger";


const redisConnection = new Redis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
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