import { Router } from "express";
import authRoutes from "./auth.routes";
import scanRoutes from "./scan.routes";
import journalRoutes from "./journal.routes";
import milestoneRoutes from "./milestone.routes";
import summaryRoutes from "./summary.routes";
import reportRoutes from "./report.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/scans", scanRoutes);
router.use("/journal", journalRoutes);
router.use("/milestones", milestoneRoutes);
router.use("/summary", summaryRoutes);
router.use("/reports", reportRoutes);

router.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

export default router;
