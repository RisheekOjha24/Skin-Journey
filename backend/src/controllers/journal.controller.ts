import { Response } from "express";
import { journalService } from "../services/journal.service";
import { sendSuccess } from "../utils/api-response.util";
import { HTTP_STATUS } from "../config/constants";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const journalController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const entry = journalService.create(req.user!.id, req.body);
    sendSuccess(res, entry, HTTP_STATUS.CREATED);
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const entry = journalService.update(req.user!.id, req.params.id, req.body);
    sendSuccess(res, entry);
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    journalService.delete(req.user!.id, req.params.id);
    sendSuccess(res, { deleted: true });
  },

  async bulkDelete(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body as { ids: string[] };
    const count = journalService.bulkDelete(req.user!.id, ids);
    sendSuccess(res, { deleted: true, count });
  },

  async list(req: AuthenticatedRequest, res: Response) {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = journalService.list(req.user!.id, { page, limit });
    sendSuccess(res, result.entries, HTTP_STATUS.OK, { pagination: result.pagination });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const entry = journalService.getById(req.user!.id, req.params.id);
    sendSuccess(res, entry);
  },
};
