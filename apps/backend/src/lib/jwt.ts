import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { parseDurationToMs } from "./duration";

export interface AccessTokenPayload {
  sub: string; // userId
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, env.jwt.accessSecret, {
    expiresIn: Math.floor(parseDurationToMs(env.jwt.accessTtl) / 1000),
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwt.accessSecret);
  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Invalid access token payload");
  }
  return { sub: decoded.sub };
}
