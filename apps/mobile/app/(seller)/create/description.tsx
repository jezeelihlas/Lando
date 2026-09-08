import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

export default function DescriptionStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [description, setDescription] = useState(wizard.description);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isValid = description.trim().length >= 10;

  return (
    <WizardStepLayout
      step={8}
      title="Description"
      subtitle="Describe the property's condition, access, neighborhood, or anything a buyer should know."
      nextDisabled={!isValid}
      onNext={async () => {
        await wizard.patch({ description });
        router.push("/(seller)/create/location");
      }}
    >
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. Flat, cleared land close to the town center with direct road access..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
        autoFocus
      />
      <Text style={styles.hint}>{description.trim().length}/4000</Text>
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 160,
  },
  hint: { ...typography.captionMuted, color: colors.textMuted, marginTop: spacing.xs, textAlign: "right" },
});
