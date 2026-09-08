import { NearbyPlaceType, PropertyNearbyPlaceDto } from "@lando/shared";
import { apiFetch } from "./client";

export interface NearbyPlaceSelectionInput {
  type: NearbyPlaceType;
  nearbyPlaceId: string;
}

export function setPropertyNearbyPlaces(
  accessToken: string,
  propertyId: string,
  selections: NearbyPlaceSelectionInput[]
) {
  return apiFetch<PropertyNearbyPlaceDto[]>(`/api/properties/${propertyId}/nearby-places`, {
    method: "POST",
    body: { selections },
    accessToken,
  });
}
