import { join } from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { env } from "./config/env";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.isProduction ? "combined" : "dev"));

  // Only the public image bucket is ever mounted as a static route — the
  // private deed folder (uploads/private) is deliberately never exposed
  // here or anywhere else (Rule 7/19).
  app.use("/uploads/public", express.static(join(__dirname, "..", "uploads", "public")));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
