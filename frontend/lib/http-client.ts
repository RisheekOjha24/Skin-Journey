import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "@/config/api.config";

/**
 * Single reusable Axios instance used by every feature service via
 * `lib/api-client.ts`. Centralizing this here means base URL, default
 * headers, timeout, and auth/logging behavior stay consistent across
 * the whole app and any future interceptor (retry, tracing, etc.)
 * applies everywhere at once.
 */

// Axios' request config type doesn't include custom metadata by
// default; this narrow augmentation lets the interceptors time each
// request without resorting to `any`.
interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: { startedAt: number };
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(API_CONFIG.authTokenStorageKey);
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeoutMs,
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use((config: RequestConfigWithMetadata) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  // Axios already serializes plain objects to JSON and sets the right
  // Content-Type automatically; the one thing worth being explicit
  // about is *not* doing that for FormData (scan photo uploads), so
  // the browser can set its own multipart boundary. Axios handles this
  // correctly by default — this comment exists so nobody "fixes" it.

  config.metadata = { startedAt: Date.now() };

  if (process.env.NODE_ENV === "development") {
    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    // eslint-disable-next-line no-console
    console.debug(
      `[api →] ${config.method?.toUpperCase()} ${config.url}`,
      isFormData ? "[FormData]" : config.data ?? ""
    );
  }

  return config;
});

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      const startedAt = (response.config as RequestConfigWithMetadata).metadata?.startedAt;
      const durationMs = startedAt ? Date.now() - startedAt : undefined;
      // eslint-disable-next-line no-console
      console.debug(
        `[api ←] ${response.status} ${response.config.url}${durationMs ? ` (${durationMs}ms)` : ""}`,
        response.data
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      const config = error.config as RequestConfigWithMetadata | undefined;
      const startedAt = config?.metadata?.startedAt;
      const durationMs = startedAt ? Date.now() - startedAt : undefined;
      // eslint-disable-next-line no-console
      console.debug(
        `[api ✕] ${error.response?.status ?? error.code ?? "ERR"} ${config?.url}${
          durationMs ? ` (${durationMs}ms)` : ""
        }`,
        error.response?.data ?? error.message
      );
    }
    // Re-thrown as-is; lib/api-client.ts is the single place that
    // normalizes this into an ApiClientError, so every caller gets the
    // same shape without each service duplicating error classification.
    return Promise.reject(error);
  }
);
