import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { env } from "./config/env";
import { RATE_LIMIT } from "./config/constants";
import routes from "./routes";
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from "./middleware/error-handler.middleware";

export function createApp(): Express {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://192.168.8.133:3000"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  }

  const globalLimiter = rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", globalLimiter);

  const authLimiter = rateLimit({
    windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
    max: RATE_LIMIT.AUTH_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // Serve uploaded scan images statically so the frontend can render them.
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

  app.use("/api", routes);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
