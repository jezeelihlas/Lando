import { env } from "../../config/env";
import { OtpProvider } from "./otp.provider";

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface PendingOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

// Resend only sends email — unlike Twilio Verify, it has no server-side
// code storage/check of its own, so this provider generates and tracks
// codes itself (in-memory, single-instance — acceptable at MVP scale).
export class ResendEmailOtpProvider implements OtpProvider {
  private pending = new Map<string, PendingOtp>();

  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string
  ) {}

  async sendOtp(email: string): Promise<void> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.pending.set(email, { code, expiresAt: Date.now() + CODE_TTL_MS, attempts: 0 });

    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: email,
        subject: "Your Lando verification code",
        text: `Your Lando verification code is ${code}. It expires in 5 minutes.`,
      }),
    });

    if (!response.ok) {
      this.pending.delete(email);
      throw new Error(`Resend request failed: HTTP ${response.status}`);
    }
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

export function createResendEmailOtpProvider(): OtpProvider | null {
  const { apiKey, fromEmail } = env.resend;
  if (!apiKey || !fromEmail) {
    return null;
  }
  return new ResendEmailOtpProvider(apiKey, fromEmail);
}
