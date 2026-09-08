import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { parseDurationToMs } from "../../lib/duration";
import { signAccessToken } from "../../lib/jwt";
import { otpProvider } from "../../providers/otp";
import { generateRefreshToken, hashRefreshToken } from "../../lib/refreshToken";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export async function requestOtp(email: string): Promise<void> {
  await otpProvider.sendOtp(email);
}

async function issueSession(userId: string): Promise<SessionTokens> {
  const accessToken = signAccessToken(userId);
  const { raw, hash } = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + parseDurationToMs(env.jwt.refreshTtl)),
    },
  });

  return { accessToken, refreshToken: raw };
}

export async function verifyOtpAndIssueSession(
  email: string,
  code: string,
  name: string
): Promise<{ tokens: SessionTokens; user: AuthenticatedUser } | null> {
  const isValid = await otpProvider.verifyOtp(email, code);
  if (!isValid) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  const tokens = await issueSession(user.id);

  return {
    tokens,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function refreshSession(rawRefreshToken: string): Promise<SessionTokens | null> {
  const tokenHash = hashRefreshToken(rawRefreshToken);

  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    return null;
  }

  // Rotation: the presented token is single-use. Revoking it here means a
  // stolen-and-reused refresh token fails on its second use.
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  return issueSession(existing.userId);
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
