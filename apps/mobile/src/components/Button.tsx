import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../theme";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  ...touchableProps
}: ButtonProps) {
  const colors = useThemeColors();
  const { styles, variantStyles, variantTextStyles } = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles[variant],
        size === "lg" ? styles.sizeLg : styles.sizeMd,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      {...touchableProps}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? colors.primary : colors.textInverse} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, variantTextStyles[variant], size === "lg" && styles.labelLg]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    base: {
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    fullWidth: { alignSelf: "stretch" },
    sizeMd: { paddingVertical: 13, paddingHorizontal: spacing.lg },
    sizeLg: { paddingVertical: 16, paddingHorizontal: spacing.xl },
    content: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    label: { ...typography.bodyMedium },
    labelLg: { fontSize: 16, fontWeight: "700" },
    disabled: { opacity: 0.45 },
  });

  const variantStyles = StyleSheet.create({
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.accent },
    outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
    ghost: { backgroundColor: colors.primaryLight },
    danger: { backgroundColor: colors.danger },
  });

  const variantTextStyles = StyleSheet.create({
    primary: { color: colors.textInverse },
    secondary: { color: colors.textInverse },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
    danger: { color: colors.textInverse },
  });

  return { styles, variantStyles, variantTextStyles };
}
