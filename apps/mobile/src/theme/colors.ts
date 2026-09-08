// Land/real-estate inspired palette: deep forest green as the brand color,
// warm neutrals instead of clinical grays, a muted gold accent for
// highlights. Every screen should pull colors from useThemeColors() —
// never inline a hex value in a screen's StyleSheet.
export const lightColors = {
  // Brand
  primary: "#1B4332",
  primaryDark: "#122F22",
  primaryLight: "#EAF2ED",
  secondary: "#52796F",
  accent: "#B08D57",
  accentLight: "#F7EFE1",

  // Neutrals (warm-toned, not clinical gray)
  background: "#FAF9F6",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F2ED",
  border: "#E8E6E0",
  borderStrong: "#D6D3CA",

  // Text
  textPrimary: "#22221F",
  textSecondary: "#6B685F",
  textMuted: "#9C988C",
  textInverse: "#FFFFFF",

  // Semantic
  success: "#2E7D46",
  successBg: "#EAF6EE",
  warning: "#B45309",
  warningBg: "#FEF3E2",
  danger: "#C0392B",
  dangerBg: "#FBEAE8",
  info: "#2563A8",
  infoBg: "#EAF1FA",

  overlay: "rgba(20, 20, 18, 0.55)",
  favorite: "#C0392B",
} as const;

// Same brand identity, re-tuned for a dark surface: the forest green is
// brightened so it stays legible on near-black backgrounds, warm neutrals
// swap to warm dark grays (not clinical blue-black).
export const darkColors = {
  // Brand
  primary: "#4C9271",
  primaryDark: "#1B4332",
  primaryLight: "#1C2A22",
  secondary: "#8FB3A4",
  accent: "#D4B27E",
  accentLight: "#332A1C",

  // Neutrals (warm-toned dark)
  background: "#16181A",
  surface: "#1F2224",
  surfaceAlt: "#26292B",
  border: "#34383A",
  borderStrong: "#454A4C",

  // Text
  textPrimary: "#F2F1EC",
  textSecondary: "#B7B4AA",
  textMuted: "#83807A",
  textInverse: "#16181A",

  // Semantic
  success: "#4CAF6C",
  successBg: "#1B2E20",
  warning: "#E0912F",
  warningBg: "#332815",
  danger: "#E0665A",
  dangerBg: "#331E1B",
  info: "#5B9BD9",
  infoBg: "#1B2733",

  overlay: "rgba(0, 0, 0, 0.65)",
  favorite: "#E0665A",
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };
