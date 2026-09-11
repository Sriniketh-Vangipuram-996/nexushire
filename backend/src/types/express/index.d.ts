import "express";
import { Logger } from "pino";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      role?: string;
      email?: string;
      tenantId?: string;
    }

    interface Request {
      user?: UserPayload;
      requestId?: string;
      log?: Logger;
    }
  }
}

export {};