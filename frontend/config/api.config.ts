export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 15000,
  authTokenStorageKey: "skin_journey_auth_token",
  authUserStorageKey: "skin_journey_auth_user",
} as const;
