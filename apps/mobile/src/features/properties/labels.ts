import { LandCondition, PropertyStatus, PropertyType, RoadAccess } from "@lando/shared";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  LAND: "Land",
  HOUSE: "House",
  HOUSE_WITH_LAND: "House + Land",
};

export const LAND_CONDITION_LABELS: Record<LandCondition, string> = {
  FLAT: "Flat area",
  SLOPED: "Sloped area",
};

export const ROAD_ACCESS_LABELS: Record<RoadAccess, string> = {
  DIRECT: "Direct road access",
  PRIVATE: "Private road",
  SHARED: "Shared road",
  OTHER: "Other access",
};

// Compact form for property cards, where space is tight.
export const ROAD_ACCESS_SHORT_LABELS: Record<RoadAccess, string> = {
  DIRECT: "Direct access",
  PRIVATE: "Private road",
  SHARED: "Shared road",
  OTHER: "Other access",
};

// Never say "Verified" here — deed upload is not legal ownership
// verification (Rule 18/19).
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  DEACTIVATED: "Deactivated",
  UNDER_REVIEW: "Under review",
  POSSIBLE_DUPLICATE: "Under review",
};

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, { bg: string; text: string }> = {
  DRAFT: { bg: "#F3F4F6", text: "#6B7280" },
  PUBLISHED: { bg: "#F0FDF4", text: "#15803D" },
  DEACTIVATED: { bg: "#FEF2F2", text: "#B91C1C" },
  UNDER_REVIEW: { bg: "#FFFBEB", text: "#B45309" },
  POSSIBLE_DUPLICATE: { bg: "#FFFBEB", text: "#B45309" },
};
