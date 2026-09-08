import { env } from "../../config/env";
import { GoogleVisionOcrProvider } from "./googleVision.provider";
import { NoOpOcrProvider } from "./noOp.provider";
import { OcrProvider } from "./ocr.provider";

export const ocrProvider: OcrProvider = env.googleCloudVisionApiKey
  ? new GoogleVisionOcrProvider(env.googleCloudVisionApiKey)
  : new NoOpOcrProvider();

if (!env.googleCloudVisionApiKey) {
  console.warn(
    "[ocr] GOOGLE_CLOUD_VISION_API_KEY is not configured — using NoOpOcrProvider (dev only, duplicate detection always reports OCR_UNCERTAIN)."
  );
}

export type { OcrProvider } from "./ocr.provider";
