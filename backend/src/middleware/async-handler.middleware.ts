import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler so thrown errors/rejected promises are
 * forwarded to Express's error pipeline instead of crashing the process
 * or requiring a try/catch in every single controller.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
