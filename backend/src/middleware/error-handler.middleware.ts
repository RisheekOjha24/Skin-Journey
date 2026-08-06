import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.util";
import { logger } from "../utils/logger.util";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants";
import { env } from "../config/env";

/**
 * Single place that turns any thrown error into an HTTP response.
 * Keeping this centralized means controllers/services only ever throw
 * ApiError (or let unexpected errors bubble up) and never format
 * responses themselves.
 */
export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ApiError) {
    logger.warn("Handled API error", {
      path: req.path,
      method: req.method,
      code: err.code,
      message: err.message,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  const error = err as Error;
  logger.error("Unhandled error", {
    path: req.path,
    method: req.method,
    message: error?.message,
    stack: env.NODE_ENV === "development" ? error?.stack : undefined,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "Something went wrong. Please try again.",
    },
  });
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.path} does not exist`,
    },
  });
}
