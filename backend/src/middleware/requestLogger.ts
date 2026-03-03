import { logger } from "../common/utils/logger";
import { Request,Response,NextFunction } from "express";


export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.log = logger.child({
    requestId: req.requestId,
  });

  next();
}