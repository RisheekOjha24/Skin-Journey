"use client";

import * as React from "react";
import { Info, HelpCircle } from "lucide-react";
import { SkinMetric, SKIN_METRIC_LABELS, SKIN_METRIC_DIRECTION } from "@/config/metrics.config";
import { METRIC_DESCRIPTIONS } from "@/config/metric-calculations.config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MetricInfoTooltipProps {
  type: "overall" | "metric";
  metric?: SkinMetric;
  className?: string;
}

function InfoContent({ type, metric }: { type: "overall" | "metric"; metric?: SkinMetric }) {
  if (type === "overall") {
    return (
      <div className="space-y-2 text-xs">
        <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
          Overall Score Calculation
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          Calculated as the simple average of all measured skin metrics, with each metric normalized to a 0–100 scale where higher scores indicate healthier skin.
        </p>
        <div className="rounded-md border border-border bg-muted/50 p-2 font-mono text-[11px] text-foreground">
          Score = Sum(Normalized Metrics) / Total Metrics
        </div>
      </div>
    );
  }

  if (!metric) return null;

  const desc = METRIC_DESCRIPTIONS[metric];
  const label = SKIN_METRIC_LABELS[metric];
  const direction = SKIN_METRIC_DIRECTION[metric];

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-display text-xs font-semibold text-foreground">{label}</h4>
        <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {direction === "higherIsBetter" ? "Higher is healthier" : "Lower is healthier"}
        </span>
      </div>
      <p className="text-muted-foreground leading-relaxed">{desc?.description}</p>
    </div>
  );
}

export function MetricInfoTooltip({ type, metric, className }: MetricInfoTooltipProps) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const titleText = type === "overall" ? "Overall Score" : metric ? SKIN_METRIC_LABELS[metric] : "Metric Info";

  const triggerButton = (
    <button
      type="button"
      className={`inline-flex items-center justify-center text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full p-0.5 ${className ?? ""}`}
      aria-label={`Info for ${titleText}`}
    >
      <Info className="h-3.5 w-3.5 shrink-0" />
    </button>
  );

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-medium">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              {titleText}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Information about {titleText}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-1">
            <InfoContent type={type} metric={metric} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-72 p-3 shadow-raised">
        <InfoContent type={type} metric={metric} />
      </PopoverContent>
    </Popover>
  );
}
