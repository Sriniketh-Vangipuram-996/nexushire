import { Request, Response } from "express";
import Event from "../models/Event";
import { logger } from "../utils/logger";

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, metadata } = req.body;

    await Event.create({
      user: req.user?.userId,
      eventType,
      metadata,
    });

    res.json({ message: "Event tracked" });
  } catch (error) {
    req.log?.error(error);
    res.status(500).json({ message: "Event tracking failed" });
  }
};
