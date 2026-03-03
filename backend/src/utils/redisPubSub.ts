import Redis from "ioredis";

const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

export const publisher = new Redis(redisUrl);
export const subscriber = new Redis(redisUrl);

publisher.on("connect", () => {
  console.log("Redis Publisher connected");
});

subscriber.on("connect", () => {
  console.log("Redis Subscriber connected");
});

publisher.on("error", (err) =>
  console.error("Redis Publisher Error:", err)
);

subscriber.on("error", (err) =>
  console.error("Redis Subscriber Error:", err)
);

export const connectPubSub = async () => {
  // ❌ DO NOT call .connect()
  // ioredis auto connects
  await publisher.ping();
  await subscriber.ping();
};