import { RoadAccess } from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { TextField } from "../../../src/components";
import { ROAD_ACCESS_LABELS } from "../../../src/features/properties/labels";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

const ROAD_ACCESS_OPTIONS: { value: RoadAccess; icon: string }[] = [
  { value: "DIRECT", icon: "🛣️" },
  { value: "PRIVATE", icon: "🔒" },
  { value: "SHARED", icon: "🤝" },
  { value: "OTHER", icon: "❓" },
];

export default function RoadInfoStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [roadWidth, setRoadWidth] = useState(wizard.roadWidth);
  const [roadAccess, setRoadAccess] = useState<RoadAccess | null>(wizard.roadAccess);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isValid = roadWidth.trim() !== "" && Number(roadWidth) > 0 && roadAccess !== null;

  return (
    <WizardStepLayout
      step={3}
      title="Road access"
      subtitle="Tell buyers how wide the road is and what kind of access it offers."
      nextDisabled={!isValid}
      onNext={async () => {
        await wizard.patch({ roadWidth, roadAccess: roadAccess! });
        router.push("/(seller)/create/land-condition");
      }}
    >
      <TextField
        label="Road width (feet)"
        value={roadWidth}
        onChangeText={setRoadWidth}
        placeholder="e.g. 20"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Road Access</Text>
      {ROAD_ACCESS_OPTIONS.map((option) => {
        const isSelected = roadAccess === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => setRoadAccess(option.value)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
              {ROAD_ACCESS_LABELS[option.value]}
            </Text>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  label: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: spacing.sm, marginBottom: spacing.xs },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionIcon: { fontSize: 18, marginRight: spacing.sm },
  optionLabel: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  optionLabelSelected: { color: colors.textPrimary },
  checkmark: { color: colors.primary, fontWeight: "700", fontSize: 16 },
});
