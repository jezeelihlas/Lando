import { apiFetchForm } from "./client";
import { LocalImagePick } from "./images";

interface DeedUploadSummary {
  status: "uploaded";
  duplicateCheckResult: "LOW_DUPLICATE_RISK" | "POSSIBLE_DUPLICATE" | "OCR_UNCERTAIN";
}

export function uploadPropertyDeed(accessToken: string, propertyId: string, file: LocalImagePick) {
  const form = new FormData();
  form.append("deed", {
    uri: file.uri,
    name: file.fileName ?? "deed.jpg",
    type: file.mimeType ?? "image/jpeg",
  } as unknown as Blob);

  return apiFetchForm<DeedUploadSummary>(`/api/properties/${propertyId}/deed`, "POST", form, accessToken);
}
