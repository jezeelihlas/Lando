import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Centralized error handling: never leak stack traces or internal error
// details to clients (security §43 — secure error handling).
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({ error: `Upload rejected: ${err.message}` });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
