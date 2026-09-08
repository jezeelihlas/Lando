import { apiFetch } from "./client";

interface HealthResponse {
  status: string;
  region: string;
  timestamp: string;
}

export function getHealth() {
  return apiFetch<HealthResponse>("/api/health");
}
