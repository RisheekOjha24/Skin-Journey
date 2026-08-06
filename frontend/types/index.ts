import { SkinMetric } from "../config/metrics.config";
import { ScanType } from "../config/scan.config";
import { MilestoneCategory } from "../config/milestones.config";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type MetricsMap = Partial<Record<SkinMetric, number>>;

export interface Scan {
  id: string;
  scanType: ScanType;
  imageUrl: string;
  overlayImageUrl: string | null;
  overallScore: number | null;
  metrics: MetricsMap;
  capturedAt: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardSummary {
  totalScans: number;
  latestScan: Scan | null;
  scoreHistory: { date: string; score: number; scanId: string }[];
  metricSeries: Record<string, { date: string; value: number }[]>;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  nextRecommendedScanDate: string | null;
}

export interface MetricComparison {
  metric: SkinMetric;
  before: number | null;
  after: number | null;
  delta: number | null;
  direction: "improved" | "regressed" | "unchanged" | "unavailable";
}

export interface ScanComparison {
  before: Scan;
  after: Scan;
  metricComparison: MetricComparison[];
  overallScoreDelta: number | null;
}

export interface JournalEntry {
  id: string;
  scanId: string | null;
  entryDate: string;
  productsUsed: string[];
  routineMorning: string | null;
  routineEvening: string | null;
  waterIntakeLiters: number | null;
  sleepHours: number | null;
  dietNotes: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  category: MilestoneCategory;
  title: string;
  description: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface ProgressSummary {
  id: string;
  summaryText: string;
  scanRangeStart: string;
  scanRangeEnd: string;
  scanCount: number;
  generatedAt: string;
}

export interface ApiErrorShape {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessShape<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}
