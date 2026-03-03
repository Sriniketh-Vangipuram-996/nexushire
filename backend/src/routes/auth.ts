import { Router } from "express";
import { signup,login,logout,verifyEmail,refresh,requestPasswordReset,resetPassword,me} from "../controllers/authController";
import { requireAuth } from "../common/middleware/auth";
import { validate } from "../common/middleware/validate";
import { loginSchema,registerSchema } from "../validators/auth.validator";
import { protect } from "../common/middleware/protect";
import { authRateLimiter, strictRateLimiter } from "../common/middleware/rateLimiter";
import { slidingWindowLimiter } from "../common/middleware/slidingWindowLimiter";

const router = Router();

router.post("/signup",authRateLimiter,validate(registerSchema),signup);
router.post("/login",slidingWindowLimiter(15*60*1000,5),validate(loginSchema),login);
router.get("/me",requireAuth,me);
router.post("/logout",logout);
router.get("/verify-email",verifyEmail);
router.post("/refresh",strictRateLimiter,refresh);
router.post("/request-password-reset",slidingWindowLimiter(15*60*1000,5),requestPasswordReset);
router.post("/reset-password",strictRateLimiter,resetPassword);

export default router;
