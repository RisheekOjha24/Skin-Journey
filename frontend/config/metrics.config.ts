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

// Distinct, accessible chart colors per metric (kept out of components).
export const SKIN_METRIC_CHART_COLORS: Record<SkinMetric, string> = {
  acne: "#B5533C",
  redness: "#C97B63",
  pores: "#8A8474",
  wrinkles: "#6B6862",
  oiliness: "#C9A227",
  texture: "#3D5C4A",
  darkCircles: "#5B6B8C",
  darkSpots: "#7A5C6B",
  radiance: "#B8677D",
  moisture: "#4A8BA8",
};
