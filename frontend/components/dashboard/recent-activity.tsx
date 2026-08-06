import * as React from "react";
import { format } from "date-fns";
import { Camera, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, Milestone } from "@/types";
import { SCAN_TYPE_LABELS } from "@/config/scan.config";
import { MILESTONE_CATEGORY_LABELS } from "@/config/milestones.config";

interface ActivityItem {
  id: string;
  type: "scan" | "milestone";
  label: string;
  sublabel: string;
  date: string;
}

export function RecentActivity({
  scans,
  milestones,
}: {
  scans: Scan[];
  milestones: Milestone[];
}) {
  const items: ActivityItem[] = [
    ...scans.map((s) => ({
      id: s.id,
      type: "scan" as const,
      label: SCAN_TYPE_LABELS[s.scanType],
      sublabel:
        s.overallScore !== null ? `Score: ${s.overallScore}` : "Processing",
      date: s.capturedAt,
    })),
    ...milestones.map((m) => ({
      id: m.id,
      type: "milestone" as const,
      label: MILESTONE_CATEGORY_LABELS[m.category],
      sublabel: m.title,
      date: m.occurredAt,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
        )}
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
              {item.type === "scan" ? (
                <Camera className="h-4 w-4" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.sublabel}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {format(new Date(item.date), "MMM d")}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
