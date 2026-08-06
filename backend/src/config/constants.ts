/**
 * Centralized, non-secret application constants.
 * Hardcoded values used across multiple modules live here instead
 * of being scattered through controllers/services.
 */

export const SKIN_METRICS = [
  "acne",
  "redness",
  "pores",
  "wrinkles",
  "oiliness",
  "texture",
  "darkCircles",
  "darkSpots",
  "radiance",
  "moisture",
] as const;

export type SkinMetric = (typeof SKIN_METRICS)[number];

export const SKIN_METRIC_LABELS: Record<SkinMetric, string> = {
  acne: "Acne",
  redness: "Redness",
  pores: "Pores",
  wrinkles: "Wrinkles",
  oiliness: "Oiliness",
  texture: "Texture",
  darkCircles: "Dark Circles",
  darkSpots: "Dark Spots",
  radiance: "Radiance",
  moisture: "Moisture",
};

// Direction matters per metric: for some, a higher API score is healthier;
// document it centrally so charts/summaries never guess.
export const SKIN_METRIC_DIRECTION: Record<SkinMetric, "higherIsBetter" | "lowerIsBetter"> = {
  acne: "lowerIsBetter",
  redness: "lowerIsBetter",
  pores: "lowerIsBetter",
  wrinkles: "lowerIsBetter",
  oiliness: "lowerIsBetter",
  texture: "higherIsBetter",
  darkCircles: "lowerIsBetter",
  darkSpots: "lowerIsBetter",
  radiance: "higherIsBetter",
  moisture: "higherIsBetter",
};

export const SCAN_TYPE = {
  BASELINE: "baseline",
  WEEKLY: "weekly",
  MANUAL: "manual",
} as const;

export type ScanType = (typeof SCAN_TYPE)[keyof typeof SCAN_TYPE];

export const MILESTONE_CATEGORIES = [
  "product_started",
  "product_stopped",
  "routine_change",
  "dermatologist_visit",
  "treatment_started",
  "lifestyle_change",
  "other",
] as const;

export type MilestoneCategory = (typeof MILESTONE_CATEGORIES)[number];

export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  product_started: "Started a Product",
  product_stopped: "Stopped a Product",
  routine_change: "Routine Change",
  dermatologist_visit: "Dermatologist Visit",
  treatment_started: "Started Treatment",
  lifestyle_change: "Lifestyle Change",
  other: "Other",
};

export const SCAN_REMINDER_INTERVAL_DAYS = 7;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_REQUESTS: 300,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX_REQUESTS: 20,
};
