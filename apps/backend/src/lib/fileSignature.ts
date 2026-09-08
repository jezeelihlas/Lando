// Magic-byte checks so an upload is validated by its actual content, not
// just the client-declared MIME type or filename extension (Rule 44 — "do
// not blindly trust the filename").

const SIGNATURES: Array<{ mimeType: string; bytes: number[]; offset?: number }> = [
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"; WEBP confirmed at offset 8
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // "%PDF"
];

function matchesSignature(buffer: Buffer, sig: (typeof SIGNATURES)[number]): boolean {
  const offset = sig.offset ?? 0;
  if (buffer.length < offset + sig.bytes.length) return false;
  return sig.bytes.every((byte, i) => buffer[offset + i] === byte);
}

export function detectFileType(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (matchesSignature(buffer, sig)) {
      if (sig.mimeType === "image/webp") {
        // RIFF is a container format; confirm the WEBP fourcc at bytes 8-11.
        const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";
        if (!isWebp) continue;
      }
      return sig.mimeType;
    }
  }
  return null;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DEED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
