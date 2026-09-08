import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

// A single PrismaClient instance per process. Under tsx watch mode, module
// reloads would otherwise spawn a new client (and new connection pool) on
// every file save — cache it on globalThis to survive hot reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ["error"] : ["warn", "error"],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
