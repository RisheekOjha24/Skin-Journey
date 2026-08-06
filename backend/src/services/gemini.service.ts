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
You will be given a user's historical skin-metric measurements (from a validated skin analysis API) and their own journal notes.

Rules you must follow strictly:
- Only describe trends that are directly supported by the numeric data provided.
- Never invent a number, a prediction, or a future outcome.
- Never give medical advice, product recommendations, or diagnoses.
- If the data is too limited to identify a trend, say so plainly instead of speculating.
- Keep the tone plain, factual, and encouraging without being exaggerated.
- Reference specific metrics and specific weeks/dates from the data given.
- Output 3-5 short sentences, plain text, no markdown formatting.`;

export const geminiService = {
  async generateProgressSummary(dataPayload: string): Promise<string> {
    try {
      const genAI = getClient();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(dataPayload);
      const text = result.response.text().trim();

      if (!text) {
        throw ApiError.externalApi("The AI summary service returned an empty response.");
      }

      return text;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Gemini summary generation failed", { error: (error as Error).message });
      throw ApiError.externalApi("Could not generate an AI summary right now. Please try again shortly.");
    }
  },
};
