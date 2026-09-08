import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { shadows } from "../theme";

interface IconButtonProps extends Omit<TouchableOpacityProps, "style"> {
  icon: string;
  variant?: "light" | "dark";
  size?: number;
}

// A circular glass-morphic button — used floating over image galleries
// (back, favorite/heart) where a plain flat button would disappear against
// busy photos. Its own colors are fixed (not theme-swapped) because it
// always sits on top of a photo, not the app background — the icon color
// follows the `variant` (glass tint), not light/dark app mode.
export function IconButton({ icon, variant = "light", size = 38, ...touchableProps }: IconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variant === "light" ? styles.light : styles.dark,
      ]}
      {...touchableProps}
    >
      <Text
        style={[
          styles.icon,
          { fontSize: size * 0.46 },
          variant === "light" ? styles.iconDark : styles.iconLight,
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  light: { backgroundColor: "rgba(255,255,255,0.92)" },
  dark: { backgroundColor: "rgba(20,20,18,0.55)" },
  icon: {},
  iconDark: { color: "#22221F" },
  iconLight: { color: "#FFFFFF" },
});
