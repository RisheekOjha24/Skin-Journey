import * as React from "react";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number | null;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  totalScans: number;
}

const TREND_META = {
  improving: { label: "Improving", icon: TrendingUp, className: "text-positive" },
  declining: { label: "Declining", icon: TrendingDown, className: "text-negative" },
  stable: { label: "Stable", icon: Minus, className: "text-muted-foreground" },
  insufficient_data: { label: "Not enough data yet", icon: HelpCircle, className: "text-muted-foreground" },
};

export function ScoreCard({ score, trend, totalScans }: ScoreCardProps) {
  const meta = TREND_META[trend];
  const Icon = meta.icon;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Latest overall score</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-5xl font-medium tabular-nums">{score ?? "—"}</span>
          {score !== null && <span className="text-lg text-muted-foreground">/ 100</span>}
        </div>
        <div className={cn("mt-3 flex items-center gap-1.5 text-sm font-medium", meta.className)}>
          <Icon className="h-4 w-4" />
          {meta.label}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Based on {totalScans} recorded scan{totalScans === 1 ? "" : "s"} · measured, not predicted
        </p>
      </CardContent>
    </Card>
  );
}
