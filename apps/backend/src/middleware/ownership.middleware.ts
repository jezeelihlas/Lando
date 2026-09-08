import { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { ApiError } from "./error.middleware";

// Single enforcement point for "a seller can only modify their own
// property" (Rule 10/39). Returns 404 rather than 403 for a property that
// exists but belongs to someone else, so a seller can't probe which
// property IDs exist by ID-guessing.
export async function requireOwnedProperty(req: Request, _res: Response, next: NextFunction) {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });

  if (!property || property.sellerId !== req.user!.id) {
    return next(new ApiError(404, "Property not found"));
  }

  req.property = property;
  next();
}
