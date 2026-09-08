import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../theme";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}

export function FilterChip({ label, selected = false, onPress, icon }: FilterChipProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon && <Text style={styles.icon}>{icon} </Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: 9,
    },
    chipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    icon: { fontSize: 13 },
    label: { ...typography.bodyMedium, color: colors.textPrimary },
    labelSelected: { color: colors.textInverse },
  });
