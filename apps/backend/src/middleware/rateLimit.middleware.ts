import rateLimit from "express-rate-limit";
import { Request } from "express";

// Keyed by IP + email so one abusive email address can't be sidestepped by
// rotating IPs, and one IP can't hammer many addresses.
function emailAndIpKey(req: Request): string {
  const email = typeof req.body?.email === "string" ? req.body.email : "unknown";
  return `${req.ip}:${email}`;
}

export const otpSendRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailAndIpKey,
  message: { error: "Too many OTP requests. Please try again later." },
});

export const otpVerifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailAndIpKey,
  message: { error: "Too many verification attempts. Please try again later." },
});
