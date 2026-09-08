import { randomBytes, createHash } from "node:crypto";

// Raw token goes to the client; only its hash is ever persisted, so a
// database read can't leak a usable session token (Rule 8).
export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = randomBytes(48).toString("hex");
  return { raw, hash: hashRefreshToken(raw) };
}

export function hashRefreshToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
