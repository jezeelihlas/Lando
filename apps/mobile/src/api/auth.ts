import { apiFetch } from "./client";

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface VerifyOtpResponse {
  tokens: SessionTokens;
  user: AuthUser;
}

interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export function sendOtp(email: string) {
  return apiFetch<{ status: string }>("/api/auth/otp/send", {
    method: "POST",
    body: { email },
  });
}

export function verifyOtp(email: string, code: string, name: string) {
  return apiFetch<VerifyOtpResponse>("/api/auth/otp/verify", {
    method: "POST",
    body: { email, code, name },
  });
}

export function refreshSession(refreshToken: string) {
  return apiFetch<SessionTokens>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logout(refreshToken: string) {
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export function getProfile(accessToken: string) {
  return apiFetch<ProfileResponse>("/api/profile", { accessToken });
}
