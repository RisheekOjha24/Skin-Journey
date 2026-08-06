import * as React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MetricComparison } from "@/types";
import { SKIN_METRIC_LABELS } from "@/config/metrics.config";

export function MetricDeltaBadge({ comparison }: { comparison: MetricComparison }) {
  if (comparison.direction === "unavailable" || comparison.delta === null) {
    return <Badge variant="outline">No data</Badge>;
  }

  if (comparison.direction === "unchanged") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Minus className="h-3 w-3" /> No change
      </Badge>
    );
  }

  const isImproved = comparison.direction === "improved";
  const Icon = comparison.delta > 0 ? ArrowUp : ArrowDown;

  return (
    <Badge variant={isImproved ? "positive" : "negative"} className="gap-1">
      <Icon className="h-3 w-3" />
      {Math.abs(comparison.delta)} pts {isImproved ? "improved" : "regressed"}
    </Badge>
  );
}

export function MetricLabel({ metric }: { metric: keyof typeof SKIN_METRIC_LABELS }) {
  return <span>{SKIN_METRIC_LABELS[metric]}</span>;
}
