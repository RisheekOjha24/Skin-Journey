import axios, { AxiosError } from "axios";
import { ApiError } from "./api-error.util";
import { logger } from "./logger.util";

/**
 * Single place that turns any error thrown by an outbound Axios call
 * into the app's internal ApiError, distinguishing network errors,
 * timeouts, auth failures, and server errors so callers never need
 * their own try/catch classification logic (goal: no duplicated error
 * handling across services).
 */
export function toExternalApiError(error: unknown, serviceName: string): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;

    if (axiosError.code === "ECONNABORTED") {
      logger.error(`${serviceName}: request timed out`, { message: axiosError.message });
      return ApiError.externalApi(`The ${serviceName} service timed out. Please try again.`);
    }

    if (!axiosError.response) {
      // Request was made but no response was received — DNS failure,
      // connection refused, dropped connection, etc.
      logger.error(`${serviceName}: network error`, {
        code: axiosError.code,
        message: axiosError.message,
      });
      return ApiError.externalApi(
        `Could not reach the ${serviceName} service. Please check your connection and try again.`
      );
    }

    const status = axiosError.response.status;
    const remoteMessage = axiosError.response.data?.error?.message;

    logger.error(`${serviceName}: received an error response`, {
      status,
      data: axiosError.response.data,
    });

    if (status === 401 || status === 403) {
      return ApiError.externalApi(`${serviceName} authentication failed. Check your API credentials.`);
    }

    if (status === 429) {
      return ApiError.externalApi(`${serviceName} rate limit exceeded. Please try again shortly.`);
    }

    if (status >= 500) {
      return ApiError.externalApi(`The ${serviceName} service is temporarily unavailable. Please try again shortly.`);
    }

    return ApiError.externalApi(remoteMessage || `The ${serviceName} service rejected the request.`);
  }

  // Preserve the original error for the stack trace / debugging, while
  // still returning a safe, user-facing ApiError.
  logger.error(`${serviceName}: unexpected non-HTTP error`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return ApiError.externalApi(`The ${serviceName} service failed unexpectedly.`);
}
