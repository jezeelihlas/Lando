import { API_BASE_URL } from "./config";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  // Set by callers once the auth module (Phase 3) issues a session token.
  accessToken?: string;
}

// Thin typed wrapper around fetch. Auth-gated seller endpoints attach
// accessToken here; guest/browse calls simply omit it.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, accessToken } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error ?? `Request failed with status ${response.status}`;
    throw new ApiClientError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Separate from apiFetch because multipart bodies must NOT have a manual
// Content-Type set — fetch derives the boundary itself from the FormData.
export async function apiFetchForm<T>(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: formData });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error ?? `Request failed with status ${response.status}`;
    throw new ApiClientError(response.status, message);
  }

  return response.json() as Promise<T>;
}
