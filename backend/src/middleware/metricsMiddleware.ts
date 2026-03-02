import { Request, Response, NextFunction } from "express";
import { httpRequestCounter, httpDurationHistogram } from "../metrics/metrics";

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = httpDurationHistogram.startTimer({ method: req.method, route: req.path });

  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });

    end();
  });

  next();
};