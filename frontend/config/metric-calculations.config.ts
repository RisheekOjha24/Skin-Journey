import { SkinMetric } from "@/config/metrics.config";

export interface MetricDescription {
  description: string;
}

export const METRIC_DESCRIPTIONS: Record<SkinMetric, MetricDescription> = {
  acne: {
    description: "Measures visible inflammatory lesions, papules, and spots.",
  },
  redness: {
    description: "Measures surface skin flushing, irritation, and vascular reactivity.",
  },
  pores: {
    description: "Measures surface pore diameter and visibility across facial zones.",
  },
  wrinkles: {
    description: "Measures the depth and density of fine lines and expression wrinkles.",
  },
  oiliness: {
    description: "Measures excess lipid accumulation and surface specular shine.",
  },
  texture: {
    description: "Measures micro-surface smoothness and epidermal skin uniformity.",
  },
  darkCircles: {
    description: "Measures infraorbital pigmentation and vascular shadows under the eyes.",
  },
  darkSpots: {
    description: "Measures localized melanin density, sun spots, and hyperpigmentation.",
  },
  radiance: {
    description: "Measures skin translucency, overall clarity, and natural glow.",
  },
  moisture: {
    description: "Measures epidermal hydration levels and moisture barrier health.",
  },
};
