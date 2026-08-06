import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/api-response.util";
import { HTTP_STATUS } from "../config/constants";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendSuccess(res, result, HTTP_STATUS.CREATED);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    sendSuccess(res, result, HTTP_STATUS.OK);
  },

  async me(req: AuthenticatedRequest, res: Response) {
    const profile = authService.getProfile(req.user!.id);
    sendSuccess(res, profile);
  },

  async completeOnboarding(req: AuthenticatedRequest, res: Response) {
    const profile = authService.completeOnboarding(req.user!.id);
    sendSuccess(res, profile);
  },
};
