import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), asyncHandler(authController.register));
router.post("/login", validateRequest(loginSchema), asyncHandler(authController.login));
router.get("/me", requireAuth, asyncHandler(authController.me));
router.post("/onboarding/complete", requireAuth, asyncHandler(authController.completeOnboarding));

export default router;
