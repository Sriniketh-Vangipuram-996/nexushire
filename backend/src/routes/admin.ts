import express from "express";
import { protect } from "../middleware/protect";
import { adminOnly } from "../middleware/adminMiddleware";
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  downloadUserAnalytics,
  getPlatformStats,
  toggleUserStatus,
  getFailedRemminders,
  retryReminder,
  getReminderHealthStats,
  getAuditLogs
} from "../controllers/adminController";
import { authorize } from "../middleware/authorize";
import { Role } from "../models/User";
import { enforceTenant } from "../middleware/tenant";

const router = express.Router();

router.use(protect,enforceTenant,authorize(Role.ADMIN));

router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/analytics", downloadUserAnalytics);
router.get("/stats", getPlatformStats);
router.patch("/users/:id/toggle", toggleUserStatus);
router.get("/reminders/failed",getFailedRemminders);
router.get("/reminders/health",getReminderHealthStats);
router.post("/reminders/:id/retry",retryReminder);
router.get("/audit-logs",getAuditLogs);
export default router;
