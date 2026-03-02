import express from "express";
import { trackEvent } from "../controllers/eventController";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, trackEvent);

export default router;
