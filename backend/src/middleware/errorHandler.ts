import { logger } from "../common/utils/logger";

export const errorHandler = (
  err: any,
  req: any,
  res: any,
  next: any
) => {
  logger.error(
    {
      method: req.method,
      url: req.url,
      body: req.body,
      error: err.message,
      stack: err.stack,
    },
    "Unhandled error"
  );

  res.status(500).json({
    message: "Internal Server Error",
  });
};