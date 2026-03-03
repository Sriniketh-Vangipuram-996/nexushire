import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { httpLogger } from "./middleware/logger";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { globalRateLimiter } from "./middleware/rateLimiter";
import v1Routes from "./api/v1";
import v2Routes from "./api/v2";

const app=express();

app.use(cors({origin:process.env.FRONTEND_URL,credentials:true}));
app.use(express.json());
app.use(httpLogger);
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(globalRateLimiter); // Apply global rate limiter to all routes
//Routes..

app.use("/api/v1",v1Routes);
app.use("/api/v2",v2Routes);
export default app;