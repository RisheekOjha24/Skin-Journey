import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { MetricsMap } from "@/types";
import { SKIN_METRICS, SKIN_METRIC_LABELS, SKIN_METRIC_DIRECTION } from "@/config/metrics.config";

export function MetricBreakdown({ metrics }: { metrics: MetricsMap }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SKIN_METRICS.map((metric) => {
        const value = metrics[metric];
        if (value === undefined) return null;
        const direction = SKIN_METRIC_DIRECTION[metric];

        return (
          <div key={metric}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">{SKIN_METRIC_LABELS[metric]}</span>
              <span className="font-mono text-muted-foreground">{value}</span>
            </div>
            <Progress value={value} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {direction === "higherIsBetter" ? "Higher is healthier" : "Lower is healthier"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
