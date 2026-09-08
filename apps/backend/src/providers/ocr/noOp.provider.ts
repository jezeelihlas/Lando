import { OcrProvider, OcrResult } from "./ocr.provider";

// Dev/MVP fallback used when GOOGLE_CLOUD_VISION_API_KEY isn't configured
// (see providers/ocr/index.ts). Always reports zero confidence and empty
// text, which the duplicate-detection service classifies as OCR_UNCERTAIN
// — never blocks publishing (Rule 20), just means duplicate detection is
// effectively disabled until a real OCR key is added.
export class NoOpOcrProvider implements OcrProvider {
  async extractText(_buffer: Buffer, _mimeType: string): Promise<OcrResult> {
    return { text: "", confidence: 0 };
  }
}
