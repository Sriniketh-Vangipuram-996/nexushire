import { createClient } from "redis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { ipKeyGenerator } from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";
const isTestOrLoad=["test","loadtest"].includes(process.env.NODE_ENV||"");
/**
 * Redis client (disabled in test)
 */
export const redisClient = isTest
  ? null
  : createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

if (!isTest && redisClient) {
  redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  redisClient.connect().then(() => {
    console.log("Redis connected (Rate Limiter)");
  });
}

/**
 * Base factory
 */
const createRateLimiter = ({
  windowMs,
  max,
  keyGenerator,
  message,
}: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: any) => string;
  message: string;
}) =>
  rateLimit({
    // ✅ Use memory store in test
    store: isTestOrLoad
      ? undefined
      : new RedisStore({
          sendCommand: (...args: string[]) =>
            redisClient!.sendCommand(args),
        }),

    windowMs,
    max,

    // ✅ Use custom keyGenerator if provided
    keyGenerator:
      keyGenerator ??
      ((req) =>
        `${req.body?.email || "unknown"}-${ipKeyGenerator(req as any)}`),

    message: {
      success: false,
      message,
    },

    standardHeaders: true,
    legacyHeaders: false,
  });

/**
 * 🌍 Global limiter
 */
export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later.",
});

/**
 * 🔐 Auth limiter
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) =>
  `${req.body?.email || "unknown"}-${ipKeyGenerator(req as any)}`,
  message: "Too many login attempts. Try again later.",
});

/**
 * 🚨 Strict limiter
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: "Too many attempts. Action temporarily blocked.",
});