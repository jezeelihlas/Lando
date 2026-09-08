import { NearbyPlaceType } from "./enums";

export interface NearbyPlaceMeta {
  type: NearbyPlaceType;
  label: string;
  icon: string;
}

// Single source of truth for the seller's nearby-place selection cards
// and the buyer's nearby-facility filter list (Rule 4: no duplicated business logic).
export const NEARBY_PLACE_META: NearbyPlaceMeta[] = [
  { type: NearbyPlaceType.SCHOOL, label: "School", icon: "🏫" },
  { type: NearbyPlaceType.RAILWAY_STATION, label: "Railway Station", icon: "🚉" },
  { type: NearbyPlaceType.BUS_STOP, label: "Bus Stop", icon: "🚌" },
  { type: NearbyPlaceType.MAIN_ROAD, label: "Main Road", icon: "🛣️" },
  { type: NearbyPlaceType.HOSPITAL, label: "Hospital", icon: "🏥" },
  { type: NearbyPlaceType.PHARMACY, label: "Pharmacy", icon: "💊" },
  { type: NearbyPlaceType.MOSQUE, label: "Mosque", icon: "🕌" },
  { type: NearbyPlaceType.HINDU_TEMPLE, label: "Hindu Temple / Kovil", icon: "🛕" },
  { type: NearbyPlaceType.BUDDHIST_TEMPLE, label: "Buddhist Temple", icon: "🛕" },
  { type: NearbyPlaceType.CHURCH, label: "Church", icon: "⛪" },
];
