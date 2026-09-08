import { NextFunction, Request, Response } from "express";
import { PropertyNearbyPlaceDto } from "@lando/shared";
import { ApiError } from "../../middleware/error.middleware";
import { InvalidNearbyPlaceError, LocationRequiredError, setPropertyNearbyPlaces } from "./nearbyPlaces.service";
import { setNearbyPlacesSchema } from "./nearbyPlaces.validation";

export async function setNearbyPlacesHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = setNearbyPlacesSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  try {
    const links = await setPropertyNearbyPlaces(req.property!.id, parsed.data.selections);
    const dtos: PropertyNearbyPlaceDto[] = links.map((link) => ({
      type: link.type,
      name: link.nearbyPlace.name,
      distanceMeters: link.distanceMeters,
    }));
    res.json(dtos);
  } catch (err) {
    if (err instanceof LocationRequiredError || err instanceof InvalidNearbyPlaceError) {
      return next(new ApiError(400, err.message));
    }
    throw err;
  }
}
