import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { MetricsMap } from "@/types";
import { SKIN_METRICS, SKIN_METRIC_LABELS, SKIN_METRIC_ICONS } from "@/config/metrics.config";
import { MetricInfoTooltip } from "./metric-calculation-info";

export function MetricBreakdown({ metrics }: { metrics: MetricsMap }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SKIN_METRICS.map((metric) => {
        const value = metrics[metric];
        if (value === undefined) return null;
        const IconComponent = SKIN_METRIC_ICONS[metric];

        return (
          <div key={metric}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                {IconComponent && <IconComponent className="h-4 w-4 text-primary shrink-0" />}
                {SKIN_METRIC_LABELS[metric]}
                <MetricInfoTooltip type="metric" metric={metric} />
              </span>
              <span className="font-mono text-muted-foreground">{value}</span>
            </div>
            <Progress value={value} />
          </div>
        );
      })}
    </div>
  );
}
