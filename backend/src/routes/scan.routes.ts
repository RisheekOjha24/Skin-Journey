import { Router } from "express";
import { scanController } from "../controllers/scan.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadScanImage } from "../middleware/upload.middleware";
import {
  createScanSchema,
  listScansSchema,
  scanIdParamSchema,
  compareScansSchema,
  bulkDeleteScansSchema,
} from "../validations/scan.validation";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  (req, res, next) => uploadScanImage(req, res, (err) => (err ? next(err) : next())),
  validateRequest(createScanSchema),
  asyncHandler(scanController.create)
);
router.get("/", validateRequest(listScansSchema), asyncHandler(scanController.list));
router.get("/dashboard", asyncHandler(scanController.dashboard));
router.get("/compare", validateRequest(compareScansSchema), asyncHandler(scanController.compare));
router.delete("/", validateRequest(bulkDeleteScansSchema), asyncHandler(scanController.bulkDelete));
router.get("/:id", validateRequest(scanIdParamSchema), asyncHandler(scanController.getById));
router.delete("/:id", validateRequest(scanIdParamSchema), asyncHandler(scanController.delete));

export default router;
