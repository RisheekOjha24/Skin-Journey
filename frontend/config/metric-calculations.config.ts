import { SkinMetric } from "@/config/metrics.config";

export interface MetricDescription {
  description: string;
}

export const METRIC_DESCRIPTIONS: Record<SkinMetric, MetricDescription> = {
  acne: {
    description: "A higher score indicates fewer or less visible acne concerns.",
  },
  redness: {
    description: "A higher score indicates less visible redness and skin irritation.",
  },
  pores: {
    description: "A higher score indicates less visible/enlarged pores.",
  },
  wrinkles: {
    description: "A higher score indicates fewer or less visible wrinkles and fine lines.",
  },
  oiliness: {
    description: "A higher score indicates better oil balance and controlled surface shine.",
  },
  texture: {
    description: "A higher score indicates smoother, more uniform skin texture.",
  },
  darkCircles: {
    description: "A higher score indicates less visible dark circles under the eyes.",
  },
  darkSpots: {
    description: "A higher score indicates fewer or less visible dark spots and hyperpigmentation.",
  },
  radiance: {
    description: "A higher score indicates higher skin radiance, clarity, and glow.",
  },
  moisture: {
    description: "A higher score indicates optimal skin hydration and moisture levels.",
  },
};
