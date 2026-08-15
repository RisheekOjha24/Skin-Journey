"use client";

import * as React from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScanComparison } from "@/types";
import { SKIN_METRIC_LABELS, SkinMetric } from "@/config/metrics.config";

interface CompareSummaryProps {
  comparison: ScanComparison;
}

export function CompareSummary({ comparison }: CompareSummaryProps) {
  const { before, after, metricComparison, overallScoreDelta } = comparison;

  const beforeScore = before.overallScore;
  const afterScore = after.overallScore;

  // Calculate top improvements and focus areas dynamically from real metric comparisons
  const { topImprovements, focusAreas, mainChanges } = React.useMemo(() => {
    // Collect valid metric deltas with improvement magnitudes
    const evaluated = metricComparison.map((m) => {
      const isHigherBetter = true;
      const improvementValue = m.delta ?? 0;

      return {
        ...m,
        isHigherBetter,
        improvementValue,
        displayDelta: m.delta ?? 0,
      };
    });

    // Sort by largest improvement first
    const sortedImprovements = [...evaluated]
      .filter((m) => m.direction === "improved")
      .sort((a, b) => b.improvementValue - a.improvementValue);

    // Sort by largest regression/room for improvement
    const sortedRegressions = [...evaluated]
      .filter((m) => m.direction === "regressed")
      .sort((a, b) => b.improvementValue - a.improvementValue);

    const topImprovements = sortedImprovements.slice(0, 3);

    // Focus areas: prioritize regressed metrics or metrics with lowest current score in 'after' scan
    const lowestMetrics = [...evaluated]
      .filter((m) => m.after !== null)
      .sort((a, b) => {
        if (a.direction === "regressed" && b.direction !== "regressed")
          return -1;
        if (b.direction === "regressed" && a.direction !== "regressed")
          return 1;
        return (a.after ?? 100) - (b.after ?? 100);
      });

    const focusAreas = (
      sortedRegressions.length > 0 ? sortedRegressions : lowestMetrics
    ).slice(0, 2);

    // Generate short, non-filler visual change narrative
    let mainChanges = "";
    if (topImprovements.length >= 2) {
      const m1 =
        SKIN_METRIC_LABELS[
          topImprovements[0].metric as SkinMetric
        ]?.toLowerCase() || "texture";
      const m2 =
        SKIN_METRIC_LABELS[
          topImprovements[1].metric as SkinMetric
        ]?.toLowerCase() || "radiance";
      mainChanges = `Your skin shows noticeable improvement in ${m1} and ${m2} compared with your previous scan.`;
    } else if (topImprovements.length === 1) {
      const m1 =
        SKIN_METRIC_LABELS[
          topImprovements[0].metric as SkinMetric
        ]?.toLowerCase() || "skin clarity";
      mainChanges = `Key visual progress was made in ${m1}, leading to a clearer overall profile.`;
    } else if (overallScoreDelta !== null && overallScoreDelta >= 0) {
      mainChanges = `Your overall skin condition remains stable with steady baseline metrics across the board.`;
    } else {
      mainChanges = `Minor fluctuations detected across key skin parameters since your last baseline scan.`;
    }

    return { topImprovements, focusAreas, mainChanges };
  }, [metricComparison, overallScoreDelta]);

  // Headline determination based on overall score delta
  let headline = "Great progress this week.";
  let badgeColor =
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  let HeadlineIcon = TrendingUp;

  if (overallScoreDelta !== null) {
    if (overallScoreDelta >= 5) {
      headline = "Great progress this week.";
      badgeColor =
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      HeadlineIcon = TrendingUp;
    } else if (overallScoreDelta > 0) {
      headline = "Steady progress made.";
      badgeColor =
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      HeadlineIcon = TrendingUp;
    } else if (overallScoreDelta === 0) {
      headline = "Skin condition is stable.";
      badgeColor =
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      HeadlineIcon = Minus;
    } else {
      headline = "Skin metrics require attention.";
      badgeColor =
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      HeadlineIcon = TrendingDown;
    }
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.03] via-card to-card shadow-sm">
      <CardContent className="p-6 space-y-5">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-display text-sm font-semibold tracking-wide uppercase text-foreground/80">
              Comparison Summary
            </h3>
          </div>
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            5-sec Takeaway
          </span>
        </div>

        {/* Headline & Score change */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-xl font-semibold text-foreground">
              {headline}
            </h4>
          </div>
          {beforeScore !== null && afterScore !== null && (
            <p className="text-sm font-medium text-muted-foreground">
              Your overall skin score{" "}
              <span className="text-foreground font-semibold">
                {overallScoreDelta !== null && overallScoreDelta > 0
                  ? "increased"
                  : overallScoreDelta !== null && overallScoreDelta < 0
                    ? "decreased"
                    : "remained steady"}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-foreground">
                {beforeScore}
              </span>{" "}
              →{" "}
              <span className="font-semibold text-foreground">
                {afterScore}
              </span>
              {overallScoreDelta !== null && overallScoreDelta !== 0 && (
                <span
                  className={`ml-2 inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${badgeColor}`}
                >
                  <HeadlineIcon className="h-3 w-3" />
                  {overallScoreDelta > 0
                    ? `+${overallScoreDelta}`
                    : overallScoreDelta}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Grid structured summary */}
        <div className="grid gap-4 sm:grid-cols-3 pt-1 border-t border-border/50">
          {/* 1. Biggest Improvements */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Biggest improvements
            </p>
            {topImprovements.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-foreground">
                {topImprovements.map((imp, idx) => {
                  const label = SKIN_METRIC_LABELS[imp.metric as SkinMetric];
                  const absChange = Math.abs(imp.displayDelta);
                  const isPlus = imp.displayDelta > 0;
                  return (
                    <span key={imp.metric} className="inline-flex items-center">
                      <span className="font-semibold">{label}</span>
                      <span className="ml-1 font-mono text-positive font-semibold">
                        {isPlus ? `+${absChange}` : `-${absChange}`}
                      </span>
                      {idx < topImprovements.length - 1 && (
                        <span className="ml-2 text-muted-foreground/50">·</span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Metrics stayed consistent
              </p>
            )}
          </div>

          {/* 2. What Changed */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              What changed
            </p>
            <p className="text-xs leading-relaxed text-foreground/90 font-normal">
              {mainChanges}
            </p>
          </div>

          {/* 3. Focus Next */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Focus next
            </p>
            {focusAreas.length > 0 ? (
              <p className="text-xs leading-relaxed text-foreground/90 font-normal">
                {focusAreas
                  .map((f, i) => {
                    const label = SKIN_METRIC_LABELS[f.metric as SkinMetric];
                    if (f.direction === "regressed") {
                      return `Focus on targeted care for ${label.toLowerCase()}${i < focusAreas.length - 1 ? " and " : "."}`;
                    }
                    return `Maintain hydration and continue monitoring ${label.toLowerCase()}${i < focusAreas.length - 1 ? " & " : "."}`;
                  })
                  .join("")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Maintain current routine and hydration.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
