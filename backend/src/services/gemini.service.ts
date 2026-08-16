import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { logger } from "../utils/logger.util";
import { ApiError } from "../utils/api-error.util";

/**
 * Thin wrapper around Google Gemini used ONLY to turn already-measured,
 * already-stored historical data into a plain-language summary. The
 * model is explicitly instructed to restate trends found in the data
 * it is given — never to add advice, diagnoses, or predictions — which
 * is enforced both by the prompt and by what data we choose to send it.
 */

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) {
    throw ApiError.externalApi(
      "AI summaries are not configured. Add a GEMINI_API_KEY to enable this feature."
    );
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

const SUMMARY_SYSTEM_INSTRUCTION = `You are an expert skin data analyst inside the skincare tracking application Skin Journey.
You will be given a user's chronological historical skin-metric measurements and journal notes.

Your task is to generate a comprehensive, high-value AI progress analysis structured strictly as a JSON object.

The JSON object MUST contain the following keys:
1. "headline": A strong, encouraging summary headline capturing overall skin progress (e.g., "Significant Skin Progress Recorded", "Steady & Hydrated Baseline Maintained", "Noticeable Texture & Clarity Improvements").
2. "scoreChange": A detailed sentence describing the overall skin score progression from baseline to current scan (e.g., "Your overall skin score increased from 68 in your baseline scan to 76 in your latest scan, showing a +8 point overall improvement.").
3. "biggestImprovements": An array of top 3-4 improved or key metrics with their score deltas (e.g., ["Radiance +8", "Texture +7", "Moisture +6", "Firmness +4"]). If no metrics improved, list key stable metrics.
4. "whatChanged": A comprehensive 3-4 sentence narrative detailing the measured skin changes between scans. Highlight specific metric trends (e.g. radiance boost, texture smoothing, pore refinement, moisture levels) and connect them with factual context from journal notes if applicable.
5. "focusNext": A clear, 2-3 sentence actionable priority section providing strategic skincare guidance (e.g., hydration focus, barrier maintenance, targeting specific metrics).

Rules you must follow strictly:
- Base every single insight strictly on the provided numeric data and journal notes.
- Do not invent speculative predictions, medical diagnoses, or unmeasured claims.
- Keep the language elegant, professional, engaging, and rich with data context.
- Output ONLY valid JSON. Do not wrap in markdown code blocks like \`\`\`json.`;

export const geminiService = {
  async generateProgressSummary(dataPayload: string): Promise<string> {
    try {
      const genAI = getClient();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(dataPayload);
      let text = result.response.text().trim();

      if (!text) {
        throw ApiError.externalApi("The AI summary service returned an empty response.");
      }

      // Clean markdown code blocks if model included them
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      return text;
    } catch (error) {
      console.error("Gemini service summary generation error:", error);
      if (error instanceof ApiError) throw error;
      logger.error("Gemini summary generation failed", { error: (error as Error).message });
      throw ApiError.externalApi("Could not generate an AI summary right now. Please try again shortly.");
    }
  },
};
