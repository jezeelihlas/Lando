import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, logout as apiLogout, refreshSession, sendOtp, verifyOtp } from "../api/auth";

const ACCESS_TOKEN_KEY = "lando.accessToken";
const REFRESH_TOKEN_KEY = "lando.refreshToken";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

type AuthStatus = "loading" | "guest" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  requestOtp: (email: string) => Promise<void>;
  confirmOtp: (email: string, code: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persistTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Restores a session on cold start: try the stored access token, and if
  // it's expired, fall back to a refresh before giving up to guest mode.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const [storedAccess, storedRefresh] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);

      if (!storedRefresh) {
        if (!cancelled) setStatus("guest");
        return;
      }

      try {
        const profile = storedAccess ? await getProfile(storedAccess) : null;
        if (profile && !cancelled) {
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          setUser(profile);
          setStatus("authenticated");
          return;
        }
        throw new Error("no cached access token");
      } catch {
        try {
          const tokens = await refreshSession(storedRefresh);
          const profile = await getProfile(tokens.accessToken);
          if (cancelled) return;
          await persistTokens(tokens.accessToken, tokens.refreshToken);
          setAccessToken(tokens.accessToken);
          setRefreshToken(tokens.refreshToken);
          setUser(profile);
          setStatus("authenticated");
        } catch {
          if (!cancelled) {
            await clearTokens();
            setStatus("guest");
          }
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    await sendOtp(email);
  }, []);

  const confirmOtp = useCallback(async (email: string, code: string, name: string) => {
    const { tokens, user: verifiedUser } = await verifyOtp(email, code, name);
    await persistTokens(tokens.accessToken, tokens.refreshToken);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(verifiedUser);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    if (refreshToken) {
      await apiLogout(refreshToken).catch(() => undefined);
    }
    await clearTokens();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setStatus("guest");
  }, [refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, accessToken, requestOtp, confirmOtp, signOut }),
    [status, user, accessToken, requestOtp, confirmOtp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
