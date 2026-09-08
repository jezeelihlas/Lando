import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, typography, useThemeColors } from "../theme";

interface BadgeProps {
  label: string;
  bg?: string;
  color?: string;
  variant?: "solid" | "soft";
}

export function Badge({ label, bg, color, variant = "soft" }: BadgeProps) {
  const colors = useThemeColors();
  const background = bg ?? (variant === "solid" ? colors.primary : colors.primaryLight);
  const textColor = color ?? (variant === "solid" ? colors.textInverse : colors.primary);

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: { ...typography.caption },
});
