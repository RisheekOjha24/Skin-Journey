import { scanRepository } from "../db/repositories/scan.repository";
import { journalRepository } from "../db/repositories/journal.repository";
import { summaryRepository } from "../db/repositories/summary.repository";
import { geminiService } from "./gemini.service";
import { ApiError } from "../utils/api-error.util";
import { SKIN_METRIC_LABELS } from "../config/constants";

/**
 * Builds the exact data payload sent to Gemini for a progress summary.
 * Only real, stored measurements and the user's own journal notes go
 * into this payload — nothing here is synthesized or estimated, which
 * is what keeps the resulting AI summary grounded in fact rather than
 * speculation.
 */
function buildSummaryPayload(userId: string): { payload: string; start: string; end: string; count: number } {
  const scans = scanRepository.allForUserOrdered(userId);

  if (scans.length < 2) {
    throw ApiError.badRequest(
      "At least two scans are needed before an AI summary can describe a trend."
    );
  }

  const journalEntries = journalRepository.allForUserOrdered(userId);

  const scanLines = scans.map((scan) => {
    const metrics = JSON.parse(scan.metrics_json) as Record<string, number>;
    const metricStr = Object.entries(metrics)
      .map(([key, value]) => `${SKIN_METRIC_LABELS[key as keyof typeof SKIN_METRIC_LABELS] ?? key}: ${value}`)
      .join(", ");
    return `Scan on ${scan.captured_at} (overall score ${scan.overall_score ?? "n/a"}): ${metricStr}`;
  });

  const journalLines = journalEntries.map((entry) => {
    const products = entry.products_used ? JSON.parse(entry.products_used) : [];
    return `Journal entry on ${entry.entry_date}: products=[${products.join(", ")}], notes="${entry.notes ?? ""}"`;
  });

  const payload = [
    "SKIN METRIC HISTORY (higher or lower is better depends on the metric; treat each line as a measured fact):",
    ...scanLines,
    "",
    "JOURNAL ENTRIES (user-provided context, not verified facts):",
    ...(journalLines.length ? journalLines : ["(no journal entries recorded)"]),
    "",
    "Task: Summarize only the measurable trends shown above in 3-5 plain sentences.",
  ].join("\n");

  return {
    payload,
    start: scans[0].captured_at,
    end: scans[scans.length - 1].captured_at,
    count: scans.length,
  };
}

export const summaryService = {
  async generate(userId: string) {
    const { payload, start, end, count } = buildSummaryPayload(userId);
    const summaryText = await geminiService.generateProgressSummary(payload);

    const record = summaryRepository.create({
      userId,
      summaryText,
      scanRangeStart: start,
      scanRangeEnd: end,
      scanCount: count,
    });

    return {
      id: record.id,
      summaryText: record.summary_text,
      scanRangeStart: record.scan_range_start,
      scanRangeEnd: record.scan_range_end,
      scanCount: record.scan_count,
      generatedAt: record.generated_at,
    };
  },

  getLatest(userId: string) {
    const record = summaryRepository.latestForUser(userId);
    if (!record) return null;
    return {
      id: record.id,
      summaryText: record.summary_text,
      scanRangeStart: record.scan_range_start,
      scanRangeEnd: record.scan_range_end,
      scanCount: record.scan_count,
      generatedAt: record.generated_at,
    };
  },
};
