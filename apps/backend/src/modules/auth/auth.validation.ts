import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  code: z.string().regex(/^\d{4,8}$/, "Invalid verification code"),
  name: z.string().trim().min(1, "Enter your name").max(100),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});
