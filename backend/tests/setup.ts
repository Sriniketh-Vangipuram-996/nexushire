/// <reference types="jest" />
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();

  //close Redis 
  const {redisClient}=await import("../src/middleware/rateLimiter");
  if(redisClient){
    await redisClient.quit();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

jest.mock("ioredis",()=>require("ioredis-mock"));