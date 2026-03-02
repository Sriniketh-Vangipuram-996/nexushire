import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
export const securityMiddleware = [
  helmet(),
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
];