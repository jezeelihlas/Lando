const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL. Set it in apps/mobile/.env (see .env.example)."
  );
}

export const API_BASE_URL = apiBaseUrl;
