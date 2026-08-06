import axios, { AxiosError } from "axios";
import { httpClient } from "./http-client";
import { MESSAGES } from "../config/messages.config";
import { ApiErrorShape, ApiSuccessShape } from "../types";

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Single place that turns any error thrown by the shared Axios client
 * into an ApiClientError, distinguishing network errors, timeouts, and
 * API-returned errors (auth, validation, server) so every service gets
 * the same, predictable error shape without its own try/catch
 * classification logic.
 */
function normalizeError(error: unknown): ApiClientError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorShape>;

    if (axiosError.code === "ECONNABORTED") {
      return new ApiClientError(MESSAGES.errors.network, "TIMEOUT_ERROR", 0);
    }

    if (!axiosError.response) {
      // Request was made but no response was received.
      return new ApiClientError(MESSAGES.errors.network, "NETWORK_ERROR", 0);
    }

    const payload = axiosError.response.data;
    return new ApiClientError(
      payload?.error?.message || MESSAGES.errors.generic,
      payload?.error?.code || "UNKNOWN_ERROR",
      axiosError.response.status,
      payload?.error?.details
    );
  }

  return new ApiClientError(MESSAGES.errors.generic, "UNKNOWN_ERROR", 0);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /**
   * @deprecated no longer required — FormData bodies are now detected
   * automatically so Axios (and the browser) can set the correct
   * multipart boundary. Kept only so existing call sites compile
   * unchanged; safe to omit in new code.
   */
  isFormData?: boolean;
  query?: Record<string, string | number | undefined>;
}

/** Same as apiRequest but also returns the `meta` block (used for pagination). */
export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { method = "GET", body, query } = options;

  try {
    const response = await httpClient.request<ApiSuccessShape<T>>({
      url: path,
      method,
      data: body,
      params: query,
    });

    return { data: response.data.data, meta: response.data.meta };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Single request wrapper used by every feature service. Centralizes
 * auth-header injection (via the shared Axios client's interceptor),
 * JSON handling, and error normalization so components never touch
 * `axios`/`fetch` directly.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { data } = await apiRequestWithMeta<T>(path, options);
  return data;
}

/**
 * For binary responses (currently: the dermatologist PDF report).
 * Axios is told to expect a Blob; if the server responds with a JSON
 * error instead (e.g. validation failure before any PDF is streamed),
 * that error blob is decoded back into the same ApiClientError shape
 * every other request produces.
 */
export async function apiDownload(path: string): Promise<Blob> {
  try {
    const response = await httpClient.get<Blob>(path, { responseType: "blob" });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const parsed = JSON.parse(text) as ApiErrorShape;
        throw new ApiClientError(
          parsed.error?.message || MESSAGES.errors.generic,
          parsed.error?.code || "UNKNOWN_ERROR",
          error.response.status,
          parsed.error?.details
        );
      } catch (parseError) {
        if (parseError instanceof ApiClientError) throw parseError;
        // Response wasn't valid JSON either — fall through to the
        // generic classification below.
      }
    }
    throw normalizeError(error);
  }
}
