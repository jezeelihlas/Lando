import { API_BASE_URL } from "../../api/config";

// Mirrors the backend's LocalDiskStorageProvider.getPublicUrl exactly —
// storageKey is always "public/{propertyId}/{file}" for anything the
// seller's own uploads produce.
export function resolveImageUrl(storageKey: string): string {
  return `${API_BASE_URL}/uploads/${storageKey}`;
}
