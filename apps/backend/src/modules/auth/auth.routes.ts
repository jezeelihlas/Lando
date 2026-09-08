import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { otpSendRateLimit, otpVerifyRateLimit } from "../../middleware/rateLimit.middleware";
import { logoutHandler, refreshHandler, sendOtpHandler, verifyOtpHandler } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/auth/otp/send", otpSendRateLimit, asyncHandler(sendOtpHandler));
authRouter.post("/auth/otp/verify", otpVerifyRateLimit, asyncHandler(verifyOtpHandler));
authRouter.post("/auth/refresh", asyncHandler(refreshHandler));
authRouter.post("/auth/logout", asyncHandler(logoutHandler));
