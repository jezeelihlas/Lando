import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middleware/error.middleware";
import { mapProvider } from "../../providers/maps";
import { nearbySearchQuerySchema, reverseGeocodeQuerySchema } from "../nearby-places/nearbyPlaces.validation";

export async function reverseGeocodeHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = reverseGeocodeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid query parameters"));
  }

  const displayName = await mapProvider.reverseGeocode(parsed.data.lat, parsed.data.lng);
  res.json({ displayName });
}

export async function nearbySearchHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = nearbySearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid query parameters"));
  }

  const candidates = await mapProvider.nearbySearch(parsed.data.lat, parsed.data.lng, parsed.data.type);
  res.json(candidates);
}
