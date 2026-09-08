// Sri Lankan mobile numbers only: +94 followed by a 7x prefix and 8 more digits.
export const SL_MOBILE_REGEX = /^\+947\d{8}$/;

export function normalizePhoneNumber(raw: string): string {
  return raw.replace(/[\s-]/g, "");
}
