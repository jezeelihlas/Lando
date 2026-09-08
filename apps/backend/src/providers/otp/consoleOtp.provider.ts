import { OtpProvider } from "./otp.provider";

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface PendingOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Development-only fallback used when Resend isn't configured (see
// providers/otp/index.ts). Logs the code to the console instead of sending
// a real email, so the OTP flow is testable without an email provider
// account. Never selected when RESEND_* env vars are set.
export class ConsoleOtpProvider implements OtpProvider {
  private pending = new Map<string, PendingOtp>();

  async sendOtp(email: string): Promise<void> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.pending.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS, attempts: 0 });
    console.log(`[dev-otp] Verification code for ${email}: ${code}`);
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const entry = this.pending.get(email);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt || entry.attempts >= MAX_ATTEMPTS) {
      this.pending.delete(email);
      return false;
    }

    entry.attempts += 1;

    if (entry.code !== code) {
      return false;
    }

    this.pending.delete(email);
    return true;
  }
}
