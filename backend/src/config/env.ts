import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/**
 * All environment variables are validated at startup with Zod.
 * If any required variable is missing or malformed, the server
 * fails fast with a clear error instead of surfacing confusing
 * runtime bugs later.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  // Database
  DATABASE_PATH: z.string().min(1).default("./data/skin-journey.db"),

  // Auth
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  // YouCam / Perfect Corp API
  YOUCAM_API_BASE_URL: z
    .string()
    .url()
    .default("https://yce-api-01.makeupar.com"),
  YOUCAM_API_KEY: z.string().optional().default(""),
  YOUCAM_MOCK_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  EXTERNAL_API_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  // Google Gemini
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Uploads
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(8),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
