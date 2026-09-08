import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireOwnedProperty } from "../../middleware/ownership.middleware";
import { setNearbyPlacesHandler } from "./nearbyPlaces.controller";

export const nearbyPlacesRouter = Router();

nearbyPlacesRouter.post(
  "/properties/:id/nearby-places",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(setNearbyPlacesHandler)
);
