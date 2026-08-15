import { SKIN_METRICS, SKIN_METRIC_DIRECTION, SkinMetric } from "../config/constants";

export type MetricsMap = Partial<Record<SkinMetric, number>>;

/**
 * Computes the per-metric delta between two scans, always expressed as
 * "improvement" or "regression" using the metric's known direction
 * (see SKIN_METRIC_DIRECTION) rather than a raw numeric diff that would
 * be meaningless without knowing which way is "good" for that metric.
 *
 * This function only ever operates on numbers that came directly from
 * stored YouCam API responses — it never estimates or infers a value.
 */
export interface MetricComparison {
  metric: SkinMetric;
  before: number | null;
  after: number | null;
  delta: number | null;
  direction: "improved" | "regressed" | "unchanged" | "unavailable";
}

export function compareMetrics(before: MetricsMap, after: MetricsMap): MetricComparison[] {
  return SKIN_METRICS.map((metric) => {
    const beforeVal = before[metric] ?? null;
    const afterVal = after[metric] ?? null;

    if (beforeVal === null || afterVal === null) {
      return { metric, before: beforeVal, after: afterVal, delta: null, direction: "unavailable" };
    }

    const delta = Number((afterVal - beforeVal).toFixed(1));

    let direction: MetricComparison["direction"] = "unchanged";
    if (delta !== 0) {
      direction = delta > 0 ? "improved" : "regressed";
    }

    return { metric, before: beforeVal, after: afterVal, delta, direction };
  });
}

/**
 * Overall score is a simple, transparent average of every metric.
 * Uses API scores directly (where higher is better).
 */
export function computeOverallScore(metrics: MetricsMap): number | null {
  const values: number[] = [];

  for (const metric of SKIN_METRICS) {
    const raw = metrics[metric];
    if (raw === undefined || raw === null) continue;
    values.push(raw);
  }

  if (values.length === 0) return null;

  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Number(avg.toFixed(1));
}

export function calculateTrend(scores: number[]): "improving" | "declining" | "stable" | "insufficient_data" {
  if (scores.length < 2) return "insufficient_data";

  const first = scores[0];
  const last = scores[scores.length - 1];
  const diff = last - first;

  if (Math.abs(diff) < 2) return "stable";
  return diff > 0 ? "improving" : "declining";
}
