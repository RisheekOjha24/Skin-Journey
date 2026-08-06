import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/api-error.util";

/**
 * Generic Zod-powered request validator. Pass a schema shaped like
 * { body?, query?, params? } and every matching part of the request
 * is parsed and replaced with its validated (and coerced/defaulted)
 * counterpart before the controller ever sees it.
 */
export function validateRequest(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.badRequest("Request validation failed", error.flatten().fieldErrors));
        return;
      }
      next(error);
    }
  };
}
