// Centralized marketplace region config (see architecture doc §56).
// Adding a new region later means adding an entry here, not scattering
// hardcoded "Kandy" checks across the mobile app and backend.

export interface RegionTown {
  name: string;
  latitude: number;
  longitude: number;
}

export interface MarketplaceRegion {
  code: string;
  displayName: string;
  towns: RegionTown[];
  center: { latitude: number; longitude: number };
  boundingBox: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
}

export const REGIONS: Record<string, MarketplaceRegion> = {
  KANDY: {
    code: "KANDY",
    displayName: "Kandy",
    // Approximate town centers, used only to sort/filter by "nearest town"
    // (product spec §30) — not precise geocoding boundaries.
    towns: [
      { name: "Kandy", latitude: 7.2906, longitude: 80.6337 },
      { name: "Peradeniya", latitude: 7.2599, longitude: 80.5977 },
      { name: "Katugastota", latitude: 7.3283, longitude: 80.6178 },
      { name: "Gampola", latitude: 7.1644, longitude: 80.5744 },
      { name: "Kundasale", latitude: 7.2917, longitude: 80.6924 },
      { name: "Akurana", latitude: 7.3667, longitude: 80.6167 },
      { name: "Digana", latitude: 7.2833, longitude: 80.7333 },
    ],
    center: { latitude: 7.2906, longitude: 80.6337 },
    boundingBox: {
      minLatitude: 7.05,
      maxLatitude: 7.45,
      minLongitude: 80.45,
      maxLongitude: 80.85,
    },
  },
};

// The MVP launch region. Do not implement other regions yet (see product spec §26).
export const MARKETPLACE_REGION: MarketplaceRegion = REGIONS.KANDY;

export function isWithinRegion(
  latitude: number,
  longitude: number,
  region: MarketplaceRegion = MARKETPLACE_REGION
): boolean {
  const { minLatitude, maxLatitude, minLongitude, maxLongitude } = region.boundingBox;
  return (
    latitude >= minLatitude &&
    latitude <= maxLatitude &&
    longitude >= minLongitude &&
    longitude <= maxLongitude
  );
}
