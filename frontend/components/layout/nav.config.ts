import { LayoutDashboard, Camera, Images, LineChart, GitCompareArrows, NotebookPen, Flag, FileText } from "lucide-react";
import { ROUTES } from "@/config/routes.config";

export const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "All Scans", href: ROUTES.scans, icon: Images },
  { label: "New Scan", href: ROUTES.newScan, icon: Camera },
  { label: "Timeline", href: ROUTES.timeline, icon: LineChart },
  { label: "Compare", href: ROUTES.compare, icon: GitCompareArrows },
  { label: "Journal", href: ROUTES.journal, icon: NotebookPen },
  { label: "Milestones", href: ROUTES.milestones, icon: Flag },
  { label: "Report", href: ROUTES.report, icon: FileText },
] as const;
