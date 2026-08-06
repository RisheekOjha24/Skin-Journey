import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.use(requireAuth);

router.get("/dermatologist", asyncHandler(reportController.generate));

export default router;
