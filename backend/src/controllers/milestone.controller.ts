import { Response } from "express";
import { milestoneService } from "../services/milestone.service";
import { sendSuccess } from "../utils/api-response.util";
import { HTTP_STATUS } from "../config/constants";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const milestoneController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const milestone = milestoneService.create(req.user!.id, req.body);
    sendSuccess(res, milestone, HTTP_STATUS.CREATED);
  },

  async list(req: AuthenticatedRequest, res: Response) {
    const milestones = milestoneService.list(req.user!.id);
    sendSuccess(res, milestones);
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    milestoneService.delete(req.user!.id, req.params.id);
    sendSuccess(res, { deleted: true });
  },
};
