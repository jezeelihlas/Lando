// Const-object + derived-type pattern instead of TS `enum`: Prisma generates
// its own enums as plain string-literal unions, and a real TS enum is a
// distinct nominal type that a structurally-identical string literal can't
// satisfy without a cast. This preserves the same `PropertyType.LAND`
// call-site ergonomics while staying structurally compatible everywhere.

export const PropertyType = {
  LAND: "LAND",
  HOUSE: "HOUSE",
  HOUSE_WITH_LAND: "HOUSE_WITH_LAND",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const RoadWidthUnit = {
  FEET: "FEET",
  METERS: "METERS",
} as const;
export type RoadWidthUnit = (typeof RoadWidthUnit)[keyof typeof RoadWidthUnit];

export const LandExtentUnit = {
  PERCHES: "PERCHES",
  ACRES: "ACRES",
} as const;
export type LandExtentUnit = (typeof LandExtentUnit)[keyof typeof LandExtentUnit];

export const RoadAccess = {
  DIRECT: "DIRECT",
  PRIVATE: "PRIVATE",
  SHARED: "SHARED",
  OTHER: "OTHER",
} as const;
export type RoadAccess = (typeof RoadAccess)[keyof typeof RoadAccess];

export const LandCondition = {
  FLAT: "FLAT",
  SLOPED: "SLOPED",
} as const;
export type LandCondition = (typeof LandCondition)[keyof typeof LandCondition];

export const NearbyPlaceType = {
  SCHOOL: "SCHOOL",
  RAILWAY_STATION: "RAILWAY_STATION",
  BUS_STOP: "BUS_STOP",
  MAIN_ROAD: "MAIN_ROAD",
  HOSPITAL: "HOSPITAL",
  PHARMACY: "PHARMACY",
  MOSQUE: "MOSQUE",
  HINDU_TEMPLE: "HINDU_TEMPLE",
  BUDDHIST_TEMPLE: "BUDDHIST_TEMPLE",
  CHURCH: "CHURCH",
} as const;
export type NearbyPlaceType = (typeof NearbyPlaceType)[keyof typeof NearbyPlaceType];

export const PropertyStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  DEACTIVATED: "DEACTIVATED",
  UNDER_REVIEW: "UNDER_REVIEW",
  POSSIBLE_DUPLICATE: "POSSIBLE_DUPLICATE",
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const DuplicateCheckResult = {
  LOW_DUPLICATE_RISK: "LOW_DUPLICATE_RISK",
  POSSIBLE_DUPLICATE: "POSSIBLE_DUPLICATE",
  OCR_UNCERTAIN: "OCR_UNCERTAIN",
} as const;
export type DuplicateCheckResult = (typeof DuplicateCheckResult)[keyof typeof DuplicateCheckResult];
