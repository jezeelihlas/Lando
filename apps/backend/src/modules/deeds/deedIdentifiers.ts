// Best-effort pattern matching over raw OCR text. Sri Lankan deeds vary
// widely in layout/language (Sinhala/Tamil/English, typed or handwritten),
// so these are heuristics, not a guaranteed parse — absence of a match is
// expected and not itself an error (product spec §21).

export interface ExtractedDeedIdentifiers {
  deedNumber: string | null;
  ownerName: string | null;
  extent: string | null;
  planNumber: string | null;
}

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

export function extractDeedIdentifiers(rawText: string): ExtractedDeedIdentifiers {
  return {
    deedNumber: firstMatch(rawText, [
      /deed\s*no\.?\s*:?\s*([A-Z0-9/-]+)/i,
      /No\.?\s*of\s*(?:the\s*)?Deed\s*:?\s*([A-Z0-9/-]+)/i,
    ]),
    ownerName: firstMatch(rawText, [
      /(?:vendor|owner|grantor)\s*:?\s*([A-Za-z.\s]{3,60})/i,
    ]),
    extent: firstMatch(rawText, [
      /extent\s*:?\s*([\d.]+\s*(?:perches?|acres?|roods?|sq\.?\s*ft\.?))/i,
    ]),
    planNumber: firstMatch(rawText, [
      /plan\s*no\.?\s*:?\s*([A-Z0-9/-]+)/i,
      /survey\s*plan\s*:?\s*([A-Z0-9/-]+)/i,
    ]),
  };
}

export function buildFingerprint(identifiers: ExtractedDeedIdentifiers, normalizedText: string): string {
  const identifierPart = [identifiers.deedNumber, identifiers.ownerName, identifiers.extent, identifiers.planNumber]
    .filter(Boolean)
    .join(" | ");
  // Falls back to the full normalized text when no identifiers were
  // extracted, so comparison still has something meaningful to work with.
  return identifierPart || normalizedText;
}
