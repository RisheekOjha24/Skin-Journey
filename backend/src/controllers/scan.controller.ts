import { Response } from "express";
import { scanService } from "../services/scan.service";
import { sendSuccess } from "../utils/api-response.util";
import { HTTP_STATUS } from "../config/constants";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ApiError } from "../utils/api-error.util";

export const scanController = {
  async create(req: AuthenticatedRequest, res: Response) {
    if (!req.file) {
      throw ApiError.badRequest("An image file is required (field name: image)");
    }

    const scan = await scanService.createScan({
      userId: req.user!.id,
      imagePath: req.file.path,
      scanType: req.body.scanType,
      capturedAt: req.body.capturedAt,
    });

    sendSuccess(res, scan, HTTP_STATUS.CREATED);
  },

  async list(req: AuthenticatedRequest, res: Response) {
    const { page, limit, from, to } = req.query as unknown as {
      page: number;
      limit: number;
      from?: string;
      to?: string;
    };
    const result = scanService.listScans(req.user!.id, { page, limit, from, to });
    sendSuccess(res, result.scans, HTTP_STATUS.OK, { pagination: result.pagination });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const scan = scanService.getScan(req.user!.id, req.params.id);
    sendSuccess(res, scan);
  },

  async compare(req: AuthenticatedRequest, res: Response) {
    const { beforeId, afterId } = req.query as unknown as { beforeId: string; afterId: string };
    const result = scanService.compareScans(req.user!.id, beforeId, afterId);
    sendSuccess(res, result);
  },

  async dashboard(req: AuthenticatedRequest, res: Response) {
    const summary = scanService.getDashboardSummary(req.user!.id);
    sendSuccess(res, summary);
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    const result = scanService.deleteScan(req.user!.id, req.params.id);
    sendSuccess(res, result);
  },

  async bulkDelete(req: AuthenticatedRequest, res: Response) {
    const result = scanService.deleteScans(req.user!.id, req.body.ids);
    sendSuccess(res, result);
  },
};
