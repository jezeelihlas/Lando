import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth.middleware";
import { nearbySearchHandler, reverseGeocodeHandler } from "./maps.controller";

export const mapsRouter = Router();

// Gated behind seller auth: these proxy calls exist for the wizard, not as
// an open geocoding service (avoids becoming an unbounded free proxy).
mapsRouter.get("/maps/reverse-geocode", requireAuth, asyncHandler(reverseGeocodeHandler));
mapsRouter.get("/maps/nearby-search", requireAuth, asyncHandler(nearbySearchHandler));
