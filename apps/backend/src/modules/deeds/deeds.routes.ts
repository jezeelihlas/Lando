import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireOwnedProperty } from "../../middleware/ownership.middleware";
import { uploadDeed } from "../../middleware/upload.middleware";
import { uploadDeedHandler } from "./deeds.controller";

export const deedsRouter = Router();

deedsRouter.post(
  "/properties/:id/deed",
  requireAuth,
  asyncHandler(requireOwnedProperty),
  uploadDeed,
  asyncHandler(uploadDeedHandler)
);
