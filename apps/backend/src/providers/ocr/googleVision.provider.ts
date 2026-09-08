import { OcrProvider, OcrResult } from "./ocr.provider";

interface VisionTextAnnotation {
  description?: string;
}
interface VisionPage {
  confidence?: number;
}
interface VisionFullTextAnnotation {
  text?: string;
  pages?: VisionPage[];
}
interface VisionImageResponse {
  fullTextAnnotation?: VisionFullTextAnnotation;
  textAnnotations?: VisionTextAnnotation[];
  error?: { message: string };
}

const VISION_ENDPOINT = "https://vision.googleapis.com/v1";

// Real implementation, used when GOOGLE_CLOUD_VISION_API_KEY is set (see
// providers/ocr/index.ts). Uses the REST API directly with an API key
// rather than the @google-cloud/vision SDK, which needs a service-account
// JSON credential — simpler for an MVP that only has a key.
export class GoogleVisionOcrProvider implements OcrProvider {
  constructor(private apiKey: string) {}

  async extractText(buffer: Buffer, mimeType: string): Promise<OcrResult> {
    if (mimeType === "application/pdf") {
      return this.extractFromPdf(buffer);
    }
    return this.extractFromImage(buffer);
  }

  private async extractFromImage(buffer: Buffer): Promise<OcrResult> {
    const response = await fetch(`${VISION_ENDPOINT}/images:annotate?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: buffer.toString("base64") },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    });

    const data = (await response.json()) as { responses: VisionImageResponse[] };
    const result = data.responses?.[0];
    if (!result || result.error) {
      return { text: "", confidence: 0 };
    }

    const text = result.fullTextAnnotation?.text ?? "";
    const pageConfidence = result.fullTextAnnotation?.pages?.[0]?.confidence;
    return { text, confidence: pageConfidence ?? (text ? 0.5 : 0) };
  }

  private async extractFromPdf(buffer: Buffer): Promise<OcrResult> {
    const response = await fetch(`${VISION_ENDPOINT}/files:annotate?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            inputConfig: { content: buffer.toString("base64"), mimeType: "application/pdf" },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            pages: [1],
          },
        ],
      }),
    });

    const data = (await response.json()) as {
      responses: Array<{ responses?: VisionImageResponse[] }>;
    };
    const pageResult = data.responses?.[0]?.responses?.[0];
    if (!pageResult || pageResult.error) {
      return { text: "", confidence: 0 };
    }

    const text = pageResult.fullTextAnnotation?.text ?? "";
    const pageConfidence = pageResult.fullTextAnnotation?.pages?.[0]?.confidence;
    return { text, confidence: pageConfidence ?? (text ? 0.5 : 0) };
  }
}
