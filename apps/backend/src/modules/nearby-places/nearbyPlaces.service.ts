import { NearbyPlaceType } from "@prisma/client";
import { haversineDistanceMeters } from "@lando/shared";
import { prisma } from "../../db/prisma";

export class LocationRequiredError extends Error {}
export class InvalidNearbyPlaceError extends Error {}

export interface NearbyPlaceSelection {
  type: NearbyPlaceType;
  nearbyPlaceId: string;
}

// Replace-all semantics: each save from the wizard's nearby-places step
// represents the seller's complete current selection (Rule 21 — only the
// seller-selected categories are ever associated with the property).
export async function setPropertyNearbyPlaces(propertyId: string, selections: NearbyPlaceSelection[]) {
  const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });
  if (property.latitude === null || property.longitude === null) {
    throw new LocationRequiredError("Set the property's exact location before selecting nearby places");
  }

  const placeIds = selections.map((s) => s.nearbyPlaceId);
  const places = await prisma.nearbyPlace.findMany({ where: { id: { in: placeIds } } });
  const placeById = new Map(places.map((p) => [p.id, p]));

  for (const selection of selections) {
    const place = placeById.get(selection.nearbyPlaceId);
    if (!place || place.type !== selection.type) {
      throw new InvalidNearbyPlaceError(`Invalid nearby place selection: ${selection.nearbyPlaceId}`);
    }
  }

  const propertyLat = Number(property.latitude);
  const propertyLng = Number(property.longitude);

  await prisma.$transaction([
    prisma.propertyNearbyPlace.deleteMany({ where: { propertyId } }),
    ...selections.map((selection) => {
      const place = placeById.get(selection.nearbyPlaceId)!;
      const distanceMeters = Math.round(
        haversineDistanceMeters(propertyLat, propertyLng, Number(place.latitude), Number(place.longitude))
      );
      return prisma.propertyNearbyPlace.create({
        data: {
          propertyId,
          nearbyPlaceId: place.id,
          type: selection.type,
          distanceMeters,
        },
      });
    }),
  ]);

  return prisma.propertyNearbyPlace.findMany({
    where: { propertyId },
    include: { nearbyPlace: true },
  });
}
