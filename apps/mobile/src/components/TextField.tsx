import { useMemo } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
}

export function TextField({ label, error, helperText, style, ...inputProps }: TextFieldProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { marginBottom: spacing.md },
    label: { ...typography.bodyMedium, color: colors.textPrimary, marginBottom: spacing.xs },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 13,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    inputError: { borderColor: colors.danger },
    errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xxs },
    helperText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  });
