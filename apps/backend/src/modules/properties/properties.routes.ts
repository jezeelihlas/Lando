import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireOwnedProperty } from "../../middleware/ownership.middleware";
import {
  createPropertyHandler,
  deactivatePropertyHandler,
  deletePropertyHandler,
  myPropertiesHandler,
  publicDetailHandler,
  publicListHandler,
  publicNearbyPlacesHandler,
  publishPropertyHandler,
  reactivatePropertyHandler,
  updatePropertyHandler,
} from "./properties.controller";

export const propertiesRouter = Router();

// Public — no authentication (product principle §3). Never includes deed
// data (Rule 7); only PUBLISHED listings are ever returned.
propertiesRouter.get("/properties", asyncHandler(publicListHandler));
propertiesRouter.get("/properties/:id", asyncHandler(publicDetailHandler));
propertiesRouter.get("/properties/:id/nearby-places", asyncHandler(publicNearbyPlacesHandler));

// Authenticated seller's own listings (any status, including drafts).
propertiesRouter.get("/my-properties", requireAuth, asyncHandler(myPropertiesHandler));

propertiesRouter.post("/properties", requireAuth, asyncHandler(createPropertyHandler));
propertiesRouter.patch(
  "/properties/:id",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(updatePropertyHandler)
);
propertiesRouter.delete(
  "/properties/:id",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(deletePropertyHandler)
);
propertiesRouter.post(
  "/properties/:id/publish",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(publishPropertyHandler)
);
propertiesRouter.post(
  "/properties/:id/deactivate",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(deactivatePropertyHandler)
);
propertiesRouter.post(
  "/properties/:id/reactivate",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(reactivatePropertyHandler)
);

// Images, deed upload, and nearby-places selection routers are mounted
// separately (see images.routes.ts, deeds.routes.ts, nearbyPlaces.routes.ts).
