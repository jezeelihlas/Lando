import { NearbyPlaceCandidateDto, NearbyPlaceType } from "@lando/shared";
import { apiFetch } from "./client";

export function reverseGeocode(accessToken: string, latitude: number, longitude: number) {
  return apiFetch<{ displayName: string | null }>(
    `/api/maps/reverse-geocode?lat=${latitude}&lng=${longitude}`,
    { accessToken }
  );
}

export function nearbySearch(
  accessToken: string,
  latitude: number,
  longitude: number,
  type: NearbyPlaceType
) {
  return apiFetch<NearbyPlaceCandidateDto[]>(
    `/api/maps/nearby-search?lat=${latitude}&lng=${longitude}&type=${type}`,
    { accessToken }
  );
}
