import { Router } from "express";
import { milestoneController } from "../controllers/milestone.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { createMilestoneSchema, milestoneIdParamSchema } from "../validations/milestone.validation";

const router = Router();
router.use(requireAuth);

router.post("/", validateRequest(createMilestoneSchema), asyncHandler(milestoneController.create));
router.get("/", asyncHandler(milestoneController.list));
router.delete("/:id", validateRequest(milestoneIdParamSchema), asyncHandler(milestoneController.delete));

export default router;
