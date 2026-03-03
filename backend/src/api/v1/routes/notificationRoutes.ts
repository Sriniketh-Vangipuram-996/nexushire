import express from "express";
import { protect } from "../../../middleware/protect";
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
  markAllRead,
} from "../controllers/notificationController";
import { cache } from "../../../middleware/cacheMiddleware";

const router = express.Router();

router.get("/", protect,cache(60),getNotifications);
router.patch("/:id/read", protect, markAsRead);
router.get("/unread-count",protect,getUnreadCount);
router.patch("/mark-all-read",protect,markAllRead);
export default router;
