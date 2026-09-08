import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireOwnedProperty } from "../../middleware/ownership.middleware";
import { uploadImages } from "../../middleware/upload.middleware";
import { deleteImageHandler, reorderImagesHandler, uploadImagesHandler } from "./images.controller";

export const imagesRouter = Router();

imagesRouter.post(
  "/properties/:id/images",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  uploadImages,
  asyncHandler(uploadImagesHandler)
);
imagesRouter.delete(
  "/properties/:id/images/:imageId",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(deleteImageHandler)
);
imagesRouter.patch(
  "/properties/:id/images/reorder",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  asyncHandler(reorderImagesHandler)
);
