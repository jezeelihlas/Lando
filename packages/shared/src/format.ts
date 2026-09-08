// Sri Lankan Rupees display formatting (product spec §23). The database
// always stores a plain number — this is presentation-only.
export function formatLKR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-LK")}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

const LAND_EXTENT_UNIT_LABEL: Record<string, string> = {
  PERCHES: "Perches",
  ACRES: "Acres",
};

export function formatLandExtent(extent: number, unit: string): string {
  const trimmed = extent % 1 === 0 ? extent.toString() : extent.toFixed(2);
  return `${trimmed} ${LAND_EXTENT_UNIT_LABEL[unit] ?? unit}`;
}
