import { NearbyPlaceType } from "@prisma/client";

export interface NearbyPlaceCandidate {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

export interface MapProvider {
  reverseGeocode(latitude: number, longitude: number): Promise<string | null>;
  // Candidates sorted nearest-first — the seller picks which specific
  // place is correct when more than one exists (product spec §17).
  nearbySearch(
    latitude: number,
    longitude: number,
    type: NearbyPlaceType,
    radiusMeters?: number
  ): Promise<NearbyPlaceCandidate[]>;
}
