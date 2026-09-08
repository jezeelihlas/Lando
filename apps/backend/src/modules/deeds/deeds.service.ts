import { prisma } from "../../db/prisma";
import { storageProvider } from "../../providers/storage";
import { detectFileType } from "../../lib/fileSignature";
import { runDuplicateDetection } from "./duplicateDetection.service";

export class InvalidDeedFileError extends Error {}

export interface DeedUploadSummary {
  status: "uploaded";
  duplicateCheckResult: "LOW_DUPLICATE_RISK" | "POSSIBLE_DUPLICATE" | "OCR_UNCERTAIN";
}

// Returns only a safe summary — never the OCR text, extracted identifiers,
// storage key, or any other private deed detail (Rule 7/19). The deed is
// evidence for duplicate detection, not something any API response echoes
// back, including to the uploading seller.
export async function uploadPropertyDeed(
  propertyId: string,
  buffer: Buffer,
  originalName: string,
  declaredMimeType: string
): Promise<DeedUploadSummary> {
  const detectedType = detectFileType(buffer);
  if (!detectedType) {
    throw new InvalidDeedFileError("File does not match an accepted image or PDF format");
  }

  const existing = await prisma.deedDocument.findUnique({ where: { propertyId }, select: { storageKey: true } });

  const storageKey = await storageProvider.savePrivate(propertyId, buffer, originalName, detectedType);

  if (existing) {
    await storageProvider.deletePrivate(existing.storageKey);
  }

  const outcome = await runDuplicateDetection(propertyId, buffer, declaredMimeType);

  await prisma.deedDocument.upsert({
    where: { propertyId },
    create: {
      propertyId,
      storageKey,
      mimeType: detectedType,
      fileSizeBytes: buffer.length,
      ocrText: outcome.ocrText || null,
      ocrConfidence: outcome.ocrConfidence,
      extractedDeedNumber: outcome.identifiers.deedNumber,
      extractedOwnerName: outcome.identifiers.ownerName,
      extractedExtent: outcome.identifiers.extent,
      extractedPlanNumber: outcome.identifiers.planNumber,
      fingerprint: outcome.fingerprint,
    },
    update: {
      storageKey,
      mimeType: detectedType,
      fileSizeBytes: buffer.length,
      ocrText: outcome.ocrText || null,
      ocrConfidence: outcome.ocrConfidence,
      extractedDeedNumber: outcome.identifiers.deedNumber,
      extractedOwnerName: outcome.identifiers.ownerName,
      extractedExtent: outcome.identifiers.extent,
      extractedPlanNumber: outcome.identifiers.planNumber,
      fingerprint: outcome.fingerprint,
    },
  });

  await prisma.duplicateCheck.create({
    data: {
      propertyId,
      result: outcome.result,
      matchedPropertyId: outcome.matchedPropertyId,
      similarityScore: outcome.similarityScore,
    },
  });

  return { status: "uploaded", duplicateCheckResult: outcome.result };
}

export function hasDeed(propertyId: string) {
  return prisma.deedDocument
    .findUnique({ where: { propertyId }, select: { id: true } })
    .then((deed) => deed !== null);
}
