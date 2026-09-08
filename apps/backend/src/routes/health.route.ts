import { Router } from "express";
import { MARKETPLACE_REGION } from "@lando/shared";
import { prisma } from "../db/prisma";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    region: MARKETPLACE_REGION.code,
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});
