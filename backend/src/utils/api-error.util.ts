import { HTTP_STATUS, ERROR_CODES } from "../config/constants";

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * A single error shape used everywhere in the app. Controllers and
 * services throw this; the centralized error-handler middleware is
 * the only place that turns it into an HTTP response.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, ERROR_CODES.VALIDATION_ERROR, details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, ERROR_CODES.UNAUTHORIZED);
  }

  static forbidden(message = "You do not have access to this resource") {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, ERROR_CODES.FORBIDDEN);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, ERROR_CODES.NOT_FOUND);
  }

  static conflict(message: string) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, ERROR_CODES.CONFLICT);
  }

  static externalApi(message: string, details?: unknown) {
    return new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, message, ERROR_CODES.EXTERNAL_API_ERROR, details);
  }

  static internal(message = "Something went wrong. Please try again.") {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, ERROR_CODES.INTERNAL_ERROR);
  }
}
