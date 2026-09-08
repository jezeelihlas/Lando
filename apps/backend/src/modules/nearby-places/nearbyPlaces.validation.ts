import { z } from "zod";
import { NearbyPlaceType } from "@prisma/client";

export const setNearbyPlacesSchema = z.object({
  selections: z
    .array(
      z.object({
        type: z.nativeEnum(NearbyPlaceType),
        nearbyPlaceId: z.string().uuid(),
      })
    )
    .max(10),
});

export const nearbySearchQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  type: z.nativeEnum(NearbyPlaceType),
});

export const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});
