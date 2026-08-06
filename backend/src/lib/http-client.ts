import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger.util";

/**
 * Factory for outbound HTTP clients used to call third-party APIs
 * (currently: YouCam). Every external integration should get its own
 * instance from this factory rather than calling `fetch`/`axios`
 * directly, so timeout, headers, and logging behavior stay consistent
 * and any future interceptor (retries, tracing, etc.) applies
 * everywhere at once.
 */

export interface HttpClientConfig {
  baseURL: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

// Axios' config type doesn't include custom metadata by default; this
// narrow augmentation lets the interceptors time each request without
// resorting to `any`.
interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: { startedAt: number };
}

export function createHttpClient(config: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeoutMs ?? env.EXTERNAL_API_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    },
  });

  client.interceptors.request.use((requestConfig: RequestConfigWithMetadata) => {
    requestConfig.metadata = { startedAt: Date.now() };

    if (env.NODE_ENV === "development") {
      logger.debug("Outbound HTTP request", {
        method: requestConfig.method?.toUpperCase(),
        url: `${requestConfig.baseURL ?? ""}${requestConfig.url ?? ""}`,
      });
    }

    return requestConfig;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (env.NODE_ENV === "development") {
        const startedAt = (response.config as RequestConfigWithMetadata).metadata?.startedAt;
        logger.debug("Outbound HTTP response", {
          method: response.config.method?.toUpperCase(),
          url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
          status: response.status,
          durationMs: startedAt ? Date.now() - startedAt : undefined,
        });
      }
      return response;
    },
    (error: AxiosError) => {
      const requestConfig = error.config as RequestConfigWithMetadata | undefined;
      const startedAt = requestConfig?.metadata?.startedAt;

      // In production, log only what's needed to debug an incident —
      // never the full request/response payload, which may contain a
      // user's photo bytes or API credentials.
      logger.warn("Outbound HTTP request failed", {
        method: requestConfig?.method?.toUpperCase(),
        url: `${requestConfig?.baseURL ?? ""}${requestConfig?.url ?? ""}`,
        status: error.response?.status,
        code: error.code,
        durationMs: startedAt ? Date.now() - startedAt : undefined,
        ...(env.NODE_ENV === "development" ? { responseData: error.response?.data } : {}),
      });

      return Promise.reject(error);
    }
  );

  return client;
}
