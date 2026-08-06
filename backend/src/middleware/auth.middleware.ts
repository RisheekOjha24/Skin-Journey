import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.util";
import { verifyAuthToken } from "../utils/jwt.util";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

/**
 * Requires a valid `Authorization: Bearer <token>` header. On success,
 * attaches { id, email } to req.user for downstream handlers.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(ApiError.unauthorized("Missing or malformed Authorization header"));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAuthToken(token);
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired session. Please log in again."));
  }
}
