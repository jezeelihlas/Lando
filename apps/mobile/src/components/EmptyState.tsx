import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing, typography, ThemeColors, useThemeColors } from "../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "🏡", title, message, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="outline" fullWidth={false} />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
    icon: { fontSize: 44, marginBottom: spacing.sm },
    title: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
    message: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs },
    action: { marginTop: spacing.lg },
  });
