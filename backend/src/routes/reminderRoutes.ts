import express from "express";
import { scheduleReminder,cancelRemainder,getUserReminders,snoozeReminder } from "../controllers/reminderController";
import { protect } from "../common/middleware/protect";
import { cache } from "../common/middleware/cacheMiddleware";

const router = express.Router();

router.post("/",protect, scheduleReminder);
router.delete("/:id",protect,cancelRemainder);
//First request->DB Hit
//Next requests within 60seconds -Redis Hit
router.get("/",protect,cache(60),getUserReminders);
router.patch("/:id/snooze",protect,snoozeReminder);
export default router;
