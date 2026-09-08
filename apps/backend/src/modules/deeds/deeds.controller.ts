import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middleware/error.middleware";
import { InvalidDeedFileError, uploadPropertyDeed } from "./deeds.service";

export async function uploadDeedHandler(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) {
    return next(new ApiError(400, "A deed file is required"));
  }

  try {
    const summary = await uploadPropertyDeed(req.property!.id, file.buffer, file.originalname, file.mimetype);
    res.status(201).json(summary);
  } catch (err) {
    if (err instanceof InvalidDeedFileError) {
      return next(new ApiError(400, err.message));
    }
    throw err;
  }
}
