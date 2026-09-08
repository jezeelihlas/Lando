import { z } from "zod";

export const reorderImagesSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
  primaryImageId: z.string().uuid().optional(),
});
