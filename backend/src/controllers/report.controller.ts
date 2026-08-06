import { Response } from "express";
import { pdfService } from "../services/pdf.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const reportController = {
  async generate(req: AuthenticatedRequest, res: Response) {
    const stream = await pdfService.generateReport(req.user!.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="skin-journey-report.pdf"');
    stream.pipe(res);
  },
};
