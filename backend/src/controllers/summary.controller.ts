import { Response } from "express";
import { summaryService } from "../services/summary.service";
import { sendSuccess } from "../utils/api-response.util";
import { HTTP_STATUS } from "../config/constants";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const summaryController = {
  async generate(req: AuthenticatedRequest, res: Response) {
    const summary = await summaryService.generate(req.user!.id);
    sendSuccess(res, summary, HTTP_STATUS.CREATED);
  },

  async getLatest(req: AuthenticatedRequest, res: Response) {
    const summary = summaryService.getLatest(req.user!.id);
    sendSuccess(res, summary);
  },
};
