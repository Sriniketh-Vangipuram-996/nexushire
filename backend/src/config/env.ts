import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

export const env={
    NODE_ENV:process.env.NODE_ENV||"development",
    PORT:Number(process.env.PORT)||5000,
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET!,
    REDIS_HOST:process.env.REDIS_HOST!,
    REDIS_PORT:Number(process.env.REDIS_PORT)|| 6379,
};