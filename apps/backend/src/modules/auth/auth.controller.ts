import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middleware/error.middleware";
import { normalizeEmail } from "../../lib/email";
import { refreshSchema, sendOtpSchema, verifyOtpSchema } from "./auth.validation";
import { requestOtp, refreshSession, revokeRefreshToken, verifyOtpAndIssueSession } from "./auth.service";

export async function sendOtpHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = sendOtpSchema.safeParse({
    email: normalizeEmail(req.body?.email ?? ""),
  });
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  try {
    await requestOtp(parsed.data.email);
    res.status(200).json({ status: "sent" });
  } catch {
    // Never leak provider-specific error details to the client.
    next(new ApiError(502, "Could not send verification code. Please try again."));
  }
}

export async function verifyOtpHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = verifyOtpSchema.safeParse({
    email: normalizeEmail(req.body?.email ?? ""),
    code: req.body?.code,
    name: req.body?.name,
  });
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  const result = await verifyOtpAndIssueSession(parsed.data.email, parsed.data.code, parsed.data.name);
  if (!result) {
    return next(new ApiError(401, "Invalid or expired verification code"));
  }

  res.status(200).json(result);
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  const tokens = await refreshSession(parsed.data.refreshToken);
  if (!tokens) {
    return next(new ApiError(401, "Invalid or expired session"));
  }

  res.status(200).json(tokens);
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request"));
  }

  await revokeRefreshToken(parsed.data.refreshToken);
  res.status(204).send();
}
