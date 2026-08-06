import { Router } from "express";
import { journalController } from "../controllers/journal.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  listJournalSchema,
} from "../validations/journal.validation";

const router = Router();
router.use(requireAuth);

router.post("/", validateRequest(createJournalEntrySchema), asyncHandler(journalController.create));
router.get("/", validateRequest(listJournalSchema), asyncHandler(journalController.list));
router.get("/:id", asyncHandler(journalController.getById));
router.patch("/:id", validateRequest(updateJournalEntrySchema), asyncHandler(journalController.update));
router.delete("/:id", asyncHandler(journalController.delete));

export default router;
