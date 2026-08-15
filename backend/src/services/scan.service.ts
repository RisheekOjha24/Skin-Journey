import path from "node:path";
import fs from "node:fs";
import { scanRepository } from "../db/repositories/scan.repository";
import { youcamService } from "./youcam.service";
import { computeOverallScore, compareMetrics, calculateTrend, MetricsMap } from "../utils/skin-metrics.util";
import { ApiError } from "../utils/api-error.util";
import { SCAN_TYPE, PAGINATION_DEFAULTS } from "../config/constants";
import { logger } from "../utils/logger.util";

function normalizeUtcIsoString(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  let s = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(s)) {
    s = s.replace(" ", "T");
  }
  if (!/[Z+-]\d{2}:?\d{2}$|Z$/.test(s)) {
    s += "Z";
  }
  return s;
}

function toPublicScan(scan: {
  id: string;
  scan_type: string;
  image_path: string;
  overlay_image_path: string | null;
  overall_score: number | null;
  metrics_json: string;
  captured_at: string;
  created_at: string;
}) {
  return {
    id: scan.id,
    scanType: scan.scan_type,
    imageUrl: `/uploads/${path.basename(scan.image_path)}`,
    overlayImageUrl: scan.overlay_image_path ? `/uploads/${path.basename(scan.overlay_image_path)}` : null,
    overallScore: scan.overall_score,
    metrics: JSON.parse(scan.metrics_json) as MetricsMap,
    capturedAt: normalizeUtcIsoString(scan.captured_at),
    createdAt: normalizeUtcIsoString(scan.created_at),
  };
}

function isLocalFilePath(value: string | null): value is string {
  return !!value && !value.startsWith("http://") && !value.startsWith("https://");
}

/**
 * Best-effort cleanup of a scan's photo(s) on disk after the DB row is
 * gone. Only touches local file paths — in live mode the overlay image
 * is a remote YouCam URL and is left alone (nothing to delete locally,
 * and it's not ours to delete).
 */
function removeScanFilesFromDisk(scan: { image_path: string; overlay_image_path: string | null }): void {
  for (const filePath of [scan.image_path, scan.overlay_image_path]) {
    if (!isLocalFilePath(filePath)) continue;
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
      logger.warn("Failed to remove scan file from disk", {
        filePath,
        error: (error as Error).message,
      });
    }
  }
}

export const scanService = {
  async createScan(params: {
    userId: string;
    imagePath: string;
    scanType?: string;
    capturedAt?: string;
  }) {
    const scanType = params.scanType ?? SCAN_TYPE.WEEKLY;

    const analysis = await youcamService.analyzeSkin(params.imagePath);
    const overallScore = computeOverallScore(analysis.metrics);

    const scan = scanRepository.create({
      userId: params.userId,
      scanType,
      imagePath: params.imagePath,
      overlayImagePath: analysis.overlayImageUrl,
      overallScore,
      metrics: analysis.metrics as Record<string, number>,
      rawResponse: analysis.rawResponse,
      capturedAt: params.capturedAt,
    });

    return toPublicScan(scan);
  },

  getScan(userId: string, scanId: string) {
    const scan = scanRepository.findByIdForUser(scanId, userId);
    if (!scan) {
      throw ApiError.notFound("Scan not found");
    }
    return toPublicScan(scan);
  },

  listScans(
    userId: string,
    opts: { page?: number; limit?: number; from?: string; to?: string }
  ) {
    const { rows, total } = scanRepository.listForUser(userId, opts);
    const page = opts.page ?? PAGINATION_DEFAULTS.page;
    const limit = opts.limit ?? PAGINATION_DEFAULTS.limit;

    return {
      scans: rows.map(toPublicScan),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  compareScans(userId: string, beforeId: string, afterId: string) {
    const before = scanRepository.findByIdForUser(beforeId, userId);
    const after = scanRepository.findByIdForUser(afterId, userId);

    if (!before || !after) {
      throw ApiError.notFound("One or both scans were not found");
    }

    const comparison = compareMetrics(
      JSON.parse(before.metrics_json),
      JSON.parse(after.metrics_json)
    );

    return {
      before: toPublicScan(before),
      after: toPublicScan(after),
      metricComparison: comparison,
      overallScoreDelta:
        before.overall_score !== null && after.overall_score !== null
          ? Number((after.overall_score - before.overall_score).toFixed(1))
          : null,
    };
  },

  getDashboardSummary(userId: string) {
    const allScans = scanRepository.allForUserOrdered(userId);
    const latest = scanRepository.latestForUser(userId);
    const totalScans = allScans.length;

    const scoreHistory = allScans
      .filter((s) => s.overall_score !== null)
      .map((s) => ({ date: normalizeUtcIsoString(s.captured_at), score: s.overall_score as number, scanId: s.id }));

    const trend = calculateTrend(scoreHistory.map((s) => s.score));

    // Build a per-metric time series so the frontend can plot each
    // measured attribute across every scan without re-deriving it.
    const metricSeries: Record<string, { date: string; value: number }[]> = {};
    for (const scan of allScans) {
      const metrics = JSON.parse(scan.metrics_json) as MetricsMap;
      for (const [metric, value] of Object.entries(metrics)) {
        if (value === undefined || value === null) continue;
        if (!metricSeries[metric]) metricSeries[metric] = [];
        metricSeries[metric].push({ date: normalizeUtcIsoString(scan.captured_at), value });
      }
    }

    return {
      totalScans,
      latestScan: latest ? toPublicScan(latest) : null,
      scoreHistory,
      metricSeries,
      trend,
      nextRecommendedScanDate: latest
        ? new Date(new Date(latest.captured_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };
  },

  deleteScan(userId: string, scanId: string) {
    const scan = scanRepository.findByIdForUser(scanId, userId);
    if (!scan) {
      throw ApiError.notFound("Scan not found");
    }

    const deleted = scanRepository.delete(scanId, userId);
    if (deleted) removeScanFilesFromDisk(scan);

    return { id: scanId, deleted };
  },

  deleteScans(userId: string, scanIds: string[]) {
    const deletedRows = scanRepository.deleteMany(scanIds, userId);
    for (const row of deletedRows) removeScanFilesFromDisk(row);

    return {
      deletedIds: deletedRows.map((r) => r.id),
      deletedCount: deletedRows.length,
    };
  },
};
