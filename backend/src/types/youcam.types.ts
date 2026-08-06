import { SkinMetric } from "../config/constants";

/**
 * Shape of the data we normalize *every* YouCam Skin Analysis response
 * into, whether it came from the real API or (in mock mode) a
 * deterministic local stand-in. Every other part of the app — scoring,
 * charts, comparisons, AI summaries — only ever reads this shape, so
 * swapping mock mode off requires no changes anywhere else.
 */
export interface NormalizedSkinAnalysis {
  metrics: Partial<Record<SkinMetric, number>>;
  overlayImageUrl: string | null;
  rawResponse: unknown;
}

export interface YouCamAnalysisRequest {
  imagePath: string;
}
