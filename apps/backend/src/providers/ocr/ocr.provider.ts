export interface OcrResult {
  text: string;
  // 0-1. Deliberately conservative when the provider can't score itself —
  // see NoOpOcrProvider — so downstream logic treats "unknown" as
  // low-confidence rather than accidentally high-confidence.
  confidence: number;
}

export interface OcrProvider {
  extractText(buffer: Buffer, mimeType: string): Promise<OcrResult>;
}
