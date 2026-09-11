import Redis from "ioredis";

const options = {
  maxRetriesPerRequest: null,
};

export const publisher = new Redis(process.env.REDIS_URL!, options);
export const subscriber = new Redis(process.env.REDIS_URL!, options);

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
  await publisher.ping();
  await subscriber.ping();
};