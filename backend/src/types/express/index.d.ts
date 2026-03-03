import "express";
import { logger } from "../../common/utils/logger";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      role?: string;
      email?: string;
      tenantId?:string;
    }

    interface Request {
      user?: UserPayload;
      requestId?:string;
      log?:typeof logger;
    }
  }
}

export {};