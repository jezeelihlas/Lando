import { DuplicateCheckResult } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { jaccardSimilarity, normalizeText } from "../../lib/textSimilarity";
import { ocrProvider } from "../../providers/ocr";
import { buildFingerprint, extractDeedIdentifiers } from "./deedIdentifiers";

const OCR_CONFIDENCE_THRESHOLD = 0.4;
const SIMILARITY_THRESHOLD = 0.6;

export interface DuplicateCheckOutcome {
  result: DuplicateCheckResult;
  matchedPropertyId: string | null;
  similarityScore: number | null;
  fingerprint: string;
  ocrText: string;
  ocrConfidence: number;
  identifiers: ReturnType<typeof extractDeedIdentifiers>;
}

// Runs the full deed-image-only duplicate-detection pipeline (product spec
// §21): OCR -> normalize -> extract identifiers -> fingerprint -> compare
// against every other property's deed fingerprint -> classify. Never
// touches NIC/passport/ID data — the deed image is the only input.
export async function runDuplicateDetection(
  propertyId: string,
  buffer: Buffer,
  mimeType: string
): Promise<DuplicateCheckOutcome> {
  const { text, confidence } = await ocrProvider.extractText(buffer, mimeType);
  const normalized = normalizeText(text);
  const identifiers = extractDeedIdentifiers(text);
  const fingerprint = buildFingerprint(identifiers, normalized);

  if (confidence < OCR_CONFIDENCE_THRESHOLD || normalized.length === 0) {
    return {
      result: DuplicateCheckResult.OCR_UNCERTAIN,
      matchedPropertyId: null,
      similarityScore: null,
      fingerprint,
      ocrText: text,
      ocrConfidence: confidence,
      identifiers,
    };
  }

  const others = await prisma.deedDocument.findMany({
    where: { propertyId: { not: propertyId }, fingerprint: { not: null } },
    select: { propertyId: true, fingerprint: true },
  });

  let bestScore = 0;
  let bestPropertyId: string | null = null;
  for (const other of others) {
    if (!other.fingerprint) continue;
    const score = jaccardSimilarity(fingerprint, other.fingerprint);
    if (score > bestScore) {
      bestScore = score;
      bestPropertyId = other.propertyId;
    }
  }

  if (bestScore >= SIMILARITY_THRESHOLD) {
    return {
      result: DuplicateCheckResult.POSSIBLE_DUPLICATE,
      matchedPropertyId: bestPropertyId,
      similarityScore: bestScore,
      fingerprint,
      ocrText: text,
      ocrConfidence: confidence,
      identifiers,
    };
  }

  return {
    result: DuplicateCheckResult.LOW_DUPLICATE_RISK,
    matchedPropertyId: null,
    similarityScore: bestScore,
    fingerprint,
    ocrText: text,
    ocrConfidence: confidence,
    identifiers,
  };
}
