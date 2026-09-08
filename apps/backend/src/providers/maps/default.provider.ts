import { NearbyPlaceType } from "@prisma/client";
import { haversineDistanceMeters } from "@lando/shared";
import { prisma } from "../../db/prisma";
import { MapProvider, NearbyPlaceCandidate } from "./map.provider";

const DEFAULT_RADIUS_METERS = 5000;
const MAX_CANDIDATES = 5;
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/reverse";

// Free, keyless default: nearby-place search runs against our own seeded
// NearbyPlace table (accurate for Kandy, no external dependency or quota),
// reverse geocoding uses OpenStreetMap Nominatim's public API. Swappable
// for a GoogleMapsProvider later by implementing the same interface — no
// caller changes needed (product spec §7).
export class DefaultMapProvider implements MapProvider {
  async nearbySearch(
    latitude: number,
    longitude: number,
    type: NearbyPlaceType,
    radiusMeters: number = DEFAULT_RADIUS_METERS
  ): Promise<NearbyPlaceCandidate[]> {
    const places = await prisma.nearbyPlace.findMany({ where: { type } });

    return places
      .map((place) => ({
        id: place.id,
        name: place.name,
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        distanceMeters: Math.round(
          haversineDistanceMeters(latitude, longitude, Number(place.latitude), Number(place.longitude))
        ),
      }))
      .filter((candidate) => candidate.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, MAX_CANDIDATES);
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const url = `${NOMINATIM_ENDPOINT}?format=json&lat=${latitude}&lon=${longitude}&zoom=16`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Lando-Kandy-Property-Marketplace/1.0 (MVP)" },
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { display_name?: string };
      return data.display_name ?? null;
    } catch {
      // Reverse geocoding is a display-only convenience — never let a
      // network hiccup here fail the caller's request.
      return null;
    }
  }
}
