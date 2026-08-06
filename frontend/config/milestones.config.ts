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

export const MILESTONE_CATEGORY_COLORS: Record<MilestoneCategory, string> = {
  product_started: "#3D5C4A",
  product_stopped: "#B5533C",
  routine_change: "#C9A227",
  dermatologist_visit: "#5B6B8C",
  treatment_started: "#B8677D",
  lifestyle_change: "#4A8BA8",
  other: "#6B6862",
};
