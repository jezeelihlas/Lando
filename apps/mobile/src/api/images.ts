import { SellerPropertyImageDto } from "@lando/shared";
import { apiFetch, apiFetchForm } from "./client";

export interface LocalImagePick {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export function uploadPropertyImages(accessToken: string, propertyId: string, images: LocalImagePick[]) {
  const form = new FormData();
  images.forEach((image, index) => {
    const fileName = image.fileName ?? `photo-${index}.jpg`;
    // React Native's fetch/FormData accepts this {uri, name, type} shape
    // directly — it streams from the local file URI, not an in-memory blob.
    form.append("images", {
      uri: image.uri,
      name: fileName,
      type: image.mimeType ?? "image/jpeg",
    } as unknown as Blob);
  });

  return apiFetchForm<SellerPropertyImageDto[]>(`/api/properties/${propertyId}/images`, "POST", form, accessToken);
}

export function deletePropertyImage(accessToken: string, propertyId: string, imageId: string) {
  return apiFetch<void>(`/api/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function reorderPropertyImages(
  accessToken: string,
  propertyId: string,
  order: string[],
  primaryImageId?: string
) {
  return apiFetch<SellerPropertyImageDto[]>(`/api/properties/${propertyId}/images/reorder`, {
    method: "PATCH",
    body: { order, primaryImageId },
    accessToken,
  });
}
