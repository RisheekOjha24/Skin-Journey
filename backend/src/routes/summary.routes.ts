import { Router } from "express";
import { summaryController } from "../controllers/summary.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.use(requireAuth);

router.post("/generate", asyncHandler(summaryController.generate));
router.get("/latest", asyncHandler(summaryController.getLatest));

export default router;
