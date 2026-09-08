import { TextStyle } from "react-native";

// System font (San Francisco / Roboto) with a deliberate, consistent scale
// — hierarchy comes from size/weight/spacing discipline, applied the same
// way on every screen, not from ad-hoc per-screen font choices.
type TypeStyle = Pick<TextStyle, "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing">;

export const typography: Record<string, TypeStyle> = {
  displayLg: { fontSize: 30, fontWeight: "800", lineHeight: 36, letterSpacing: -0.4 },
  displayMd: { fontSize: 24, fontWeight: "800", lineHeight: 30, letterSpacing: -0.3 },
  h1: { fontSize: 20, fontWeight: "700", lineHeight: 26 },
  h2: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  h3: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  bodyLg: { fontSize: 16, fontWeight: "400", lineHeight: 23 },
  body: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  bodyMedium: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  caption: { fontSize: 12.5, fontWeight: "500", lineHeight: 17 },
  captionMuted: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
  overline: { fontSize: 11, fontWeight: "700", lineHeight: 14, letterSpacing: 0.6 },
  priceLg: { fontSize: 22, fontWeight: "800", lineHeight: 27, letterSpacing: -0.3 },
  priceXl: { fontSize: 26, fontWeight: "800", lineHeight: 31, letterSpacing: -0.4 },
};
