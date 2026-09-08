import { DefaultMapProvider } from "./default.provider";
import { MapProvider } from "./map.provider";

export const mapProvider: MapProvider = new DefaultMapProvider();
export type { MapProvider, NearbyPlaceCandidate } from "./map.provider";
