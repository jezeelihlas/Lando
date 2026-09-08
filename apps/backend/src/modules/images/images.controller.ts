import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middleware/error.middleware";
import { addPropertyImages, deletePropertyImage, InvalidFileError, reorderPropertyImages } from "./images.service";
import { reorderImagesSchema } from "./images.validation";

export async function uploadImagesHandler(req: Request, res: Response, next: NextFunction) {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return next(new ApiError(400, "At least one image file is required"));
  }

  try {
    const images = await addPropertyImages(
      req.property!.id,
      files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype }))
    );
    res.status(201).json(images);
  } catch (err) {
    if (err instanceof InvalidFileError) {
      return next(new ApiError(400, err.message));
    }
    throw err;
  }
}

export async function deleteImageHandler(req: Request, res: Response, next: NextFunction) {
  const deleted = await deletePropertyImage(req.property!.id, req.params.imageId);
  if (!deleted) {
    return next(new ApiError(404, "Image not found"));
  }
  res.status(204).send();
}

export async function reorderImagesHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = reorderImagesSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  try {
    const images = await reorderPropertyImages(req.property!.id, parsed.data.order, parsed.data.primaryImageId);
    res.json(images);
  } catch (err) {
    if (err instanceof InvalidFileError) {
      return next(new ApiError(400, err.message));
    }
    throw err;
  }
}
