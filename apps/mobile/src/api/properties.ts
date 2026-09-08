import {
  PropertyDetailDto,
  PropertyListResponse,
  PropertyNearbyPlaceDto,
  PropertySearchFilters,
  PropertyType,
  PropertyUpdateInput,
  SellerPropertyDto,
} from "@lando/shared";
import { apiFetch } from "./client";

export function getMyProperties(accessToken: string) {
  return apiFetch<SellerPropertyDto[]>("/api/my-properties", { accessToken });
}

function buildQueryString(filters: PropertySearchFilters): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.priceMin !== undefined) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set("priceMax", String(filters.priceMax));
  if (filters.landCondition) params.set("landCondition", filters.landCondition);
  if (filters.roadWidthMin !== undefined) params.set("roadWidthMin", String(filters.roadWidthMin));
  if (filters.nearby && filters.nearby.length > 0) params.set("nearby", filters.nearby.join(","));
  if (filters.town) params.set("town", filters.town);
  if (filters.page) params.set("page", String(filters.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function getProperties(filters: PropertySearchFilters = {}) {
  return apiFetch<PropertyListResponse>(`/api/properties${buildQueryString(filters)}`);
}

export function getPropertyDetail(id: string) {
  return apiFetch<PropertyDetailDto>(`/api/properties/${id}`);
}

export function getPropertyNearbyPlaces(id: string) {
  return apiFetch<PropertyNearbyPlaceDto[]>(`/api/properties/${id}/nearby-places`);
}

export function createProperty(accessToken: string, type: PropertyType) {
  return apiFetch<SellerPropertyDto>("/api/properties", {
    method: "POST",
    body: { type },
    accessToken,
  });
}

export function updateProperty(accessToken: string, id: string, data: PropertyUpdateInput) {
  return apiFetch<SellerPropertyDto>(`/api/properties/${id}`, {
    method: "PATCH",
    body: data,
    accessToken,
  });
}

export function deleteMyProperty(accessToken: string, id: string) {
  return apiFetch<void>(`/api/properties/${id}`, { method: "DELETE", accessToken });
}

export function publishProperty(accessToken: string, id: string) {
  return apiFetch<SellerPropertyDto>(`/api/properties/${id}/publish`, {
    method: "POST",
    body: { phoneVisibilityConfirmed: true },
    accessToken,
  });
}

export function deactivateProperty(accessToken: string, id: string) {
  return apiFetch<SellerPropertyDto>(`/api/properties/${id}/deactivate`, { method: "POST", accessToken });
}

export function reactivateProperty(accessToken: string, id: string) {
  return apiFetch<SellerPropertyDto>(`/api/properties/${id}/reactivate`, { method: "POST", accessToken });
}
