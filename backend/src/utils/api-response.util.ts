import { Response } from "express";

/**
 * Consistent success envelope for every endpoint:
 * { success: true, data, meta? }
 * Keeping this in one helper means every route returns the same shape.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}
