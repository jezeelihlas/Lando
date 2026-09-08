import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Screen } from "../../components";
import { spacing, typography, ThemeColors, useThemeColors } from "../../theme";

const TOTAL_STEPS = 11;

interface WizardStepLayoutProps {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void | Promise<void>;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function WizardStepLayout({
  step,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = "Next",
  nextDisabled,
}: WizardStepLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function handleNext() {
    setError(null);
    setLoading(true);
    try {
      await onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={["top"]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </ScrollView>

        <View style={styles.footer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button label={nextLabel} onPress={handleNext} disabled={nextDisabled} loading={loading} size="lg" />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backLink: { ...typography.bodyMedium, color: colors.textPrimary },
  stepText: { ...typography.caption, color: colors.textSecondary, fontWeight: "700" },
  progressTrack: { height: 4, backgroundColor: colors.surfaceAlt, marginHorizontal: spacing.lg, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.displayMd, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xs, lineHeight: 20 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm, textAlign: "center" },
});
