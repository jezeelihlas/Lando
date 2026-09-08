import { z } from "zod";
import { LandCondition, LandExtentUnit, NearbyPlaceType, PropertyType, RoadAccess, RoadWidthUnit } from "@prisma/client";
import { isWithinRegion } from "@lando/shared";
import { normalizePhoneNumber, SL_MOBILE_REGEX } from "../../lib/phone";

const commaSeparated = (schema: z.ZodTypeAny) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : value.split(",")))
    .pipe(z.array(schema));

export const publicListQuerySchema = z.object({
  type: z.nativeEnum(PropertyType).optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  landCondition: z.nativeEnum(LandCondition).optional(),
  roadWidthMin: z.coerce.number().nonnegative().optional(),
  nearby: commaSeparated(z.nativeEnum(NearbyPlaceType)).optional(),
  town: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export const createPropertySchema = z.object({
  type: z.nativeEnum(PropertyType),
});

// Every field optional — the wizard PATCHes whichever step the seller just
// completed. Each field is still strictly validated when present so a
// half-filled draft can never contain a malformed value (Rule 5/6).
export const updatePropertySchema = z.object({
  type: z.nativeEnum(PropertyType).optional(),
  roadWidth: z.coerce.number().positive().max(1000).optional(),
  roadWidthUnit: z.nativeEnum(RoadWidthUnit).optional(),
  roadAccess: z.nativeEnum(RoadAccess).optional(),
  landCondition: z.nativeEnum(LandCondition).optional(),
  landExtent: z.coerce.number().positive().max(100000).optional(),
  landExtentUnit: z.nativeEnum(LandExtentUnit).optional(),
  price: z.coerce.number().positive().optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(4000).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  contactPhoneNumber: z
    .string()
    .transform(normalizePhoneNumber)
    .pipe(z.string().regex(SL_MOBILE_REGEX, "Enter a valid Sri Lankan mobile number (+947XXXXXXXX)"))
    .optional(),
}).refine(
  (data) =>
    data.latitude === undefined ||
    data.longitude === undefined ||
    isWithinRegion(data.latitude, data.longitude),
  { message: "Selected location is outside the Kandy service area", path: ["latitude"] }
);

export const publishPropertySchema = z.object({
  phoneVisibilityConfirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm your phone number will be visible to buyers" }),
  }),
});
