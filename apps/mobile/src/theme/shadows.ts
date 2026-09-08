import { Platform, ViewStyle } from "react-native";

// RN needs both the iOS shadow* properties and Android's `elevation` to get
// a consistent look on both platforms — these presets bundle them so a
// screen never has to think about the split.
function shadow(offsetY: number, opacity: number, radius: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadows = {
  none: {},
  sm: shadow(1, 0.06, 3, 2),
  md: shadow(4, 0.08, 10, 4),
  lg: shadow(10, 0.12, 20, 8),
};
