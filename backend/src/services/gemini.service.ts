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

const SUMMARY_SYSTEM_INSTRUCTION = `You are a data-summarization assistant inside a skincare tracking app called Skin Journey.
You will be given a user's historical skin-metric measurements and journal notes.

Your task is to generate a concise, premium "5-second takeaway" summary structured strictly as a JSON object.

The JSON object MUST contain the following keys:
1. "headline": A short, confident headline summarizing overall skin progress (e.g., "Great progress this week.", "Steady progress overall.", "Skin condition is stable.", or "Skin metrics require attention.").
2. "scoreChange": A clear sentence describing the overall skin score change from earliest scan to latest scan (e.g., "Your overall skin score increased from 68 to 76.", "Your overall skin score remained steady at 72.").
3. "biggestImprovements": An array of top 2-3 improved metrics with their score changes formatted like "Metric Name +Change" (e.g., ["Radiance +8", "Texture +7", "Moisture +6"]). If no metrics improved, list key stable metrics or empty array.
4. "whatChanged": A very short explanation (1-2 sentences) describing the meaningful visual or metric changes between the scans.
5. "focusNext": A short section (1-2 sentences) with actionable priorities based on the metrics.

Rules you must follow strictly:
- Base everything strictly on the provided numeric data.
- Keep copy concise, minimal, clean, and factual.
- Avoid generic AI filler, excessive explanation, medical claims, or long paragraphs.
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
