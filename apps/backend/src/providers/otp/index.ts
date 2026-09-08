import { env } from "../../config/env";
import { ConsoleOtpProvider } from "./consoleOtp.provider";
import { OtpProvider } from "./otp.provider";
import { createResendEmailOtpProvider } from "./resendEmailOtp.provider";

function buildOtpProvider(): OtpProvider {
  const resendProvider = createResendEmailOtpProvider();
  if (resendProvider) {
    return resendProvider;
  }

  if (env.isProduction) {
    throw new Error("RESEND_API_KEY / RESEND_FROM_EMAIL must be set in production.");
  }

  console.warn(
    "[otp] Resend is not configured — using ConsoleOtpProvider (dev only, logs codes to the console)."
  );
  return new ConsoleOtpProvider();
}

export const otpProvider: OtpProvider = buildOtpProvider();
export type { OtpProvider } from "./otp.provider";
