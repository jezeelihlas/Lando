import { NextFunction, Request, Response } from "express";
import { PropertyNearbyPlaceDto } from "@lando/shared";
import { ApiError } from "../../middleware/error.middleware";
import {
  createPropertySchema,
  publicListQuerySchema,
  publishPropertySchema,
  updatePropertySchema,
} from "./properties.validation";
import { toPropertyDetailDto } from "./properties.mapper";
import {
  createDraftProperty,
  deactivateProperty,
  deleteProperty,
  getPublicPropertyById,
  getPublicPropertyNearbyPlaces,
  listPropertiesBySeller,
  listPublicProperties,
  publishProperty,
  reactivateProperty,
  updateDraftProperty,
  validateReadyToPublish,
} from "./properties.service";

export async function myPropertiesHandler(req: Request, res: Response) {
  const properties = await listPropertiesBySeller(req.user!.id);
  res.json(properties);
}

export async function publicListHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = publicListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid query parameters"));
  }

  const result = await listPublicProperties(parsed.data);
  res.json(result);
}

export async function publicDetailHandler(req: Request, res: Response, next: NextFunction) {
  const property = await getPublicPropertyById(req.params.id);
  if (!property) {
    return next(new ApiError(404, "Property not found"));
  }
  res.json(toPropertyDetailDto(property));
}

export async function publicNearbyPlacesHandler(req: Request, res: Response, next: NextFunction) {
  const property = await getPublicPropertyById(req.params.id);
  if (!property) {
    return next(new ApiError(404, "Property not found"));
  }

  const links = await getPublicPropertyNearbyPlaces(req.params.id);
  const dtos: PropertyNearbyPlaceDto[] = links.map((link) => ({
    type: link.type,
    name: link.nearbyPlace.name,
    distanceMeters: link.distanceMeters,
  }));
  res.json(dtos);
}

export async function createPropertyHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = createPropertySchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  const property = await createDraftProperty(req.user!.id, parsed.data.type);
  res.status(201).json(property);
}

// req.property is populated by requireOwnedProperty — ownership is already
// verified by the time this handler runs (Rule 10/39).
export async function updatePropertyHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = updatePropertySchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  const updated = await updateDraftProperty(req.property!.id, parsed.data);
  res.json(updated);
}

export async function deletePropertyHandler(req: Request, res: Response) {
  await deleteProperty(req.property!.id);
  res.status(204).send();
}

export async function deactivatePropertyHandler(req: Request, res: Response, next: NextFunction) {
  if (req.property!.status !== "PUBLISHED") {
    return next(new ApiError(400, "Only a published property can be deactivated"));
  }
  const updated = await deactivateProperty(req.property!.id);
  res.json(updated);
}

export async function reactivatePropertyHandler(req: Request, res: Response, next: NextFunction) {
  if (req.property!.status !== "DEACTIVATED") {
    return next(new ApiError(400, "Only a deactivated property can be reactivated"));
  }
  const updated = await reactivateProperty(req.property!.id);
  res.json(updated);
}

export async function publishPropertyHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = publishPropertySchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  const { missing } = await validateReadyToPublish(req.property!.id);
  if (missing.length > 0) {
    return next(new ApiError(400, `Missing required information: ${missing.join(", ")}`));
  }

  const updated = await publishProperty(req.property!.id);
  res.json(updated);
}
