import { LandCondition, LandExtentUnit } from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { TextField } from "../../../src/components";
import { LAND_CONDITION_LABELS } from "../../../src/features/properties/labels";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

const CONDITION_OPTIONS: { value: LandCondition; icon: string }[] = [
  { value: "FLAT", icon: "🌱" },
  { value: "SLOPED", icon: "⛰️" },
];

const UNIT_OPTIONS: { value: LandExtentUnit; label: string }[] = [
  { value: "PERCHES", label: "Perches" },
  { value: "ACRES", label: "Acres" },
];

export default function LandConditionStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [extent, setExtent] = useState(wizard.landExtent);
  const [extentUnit, setExtentUnit] = useState<LandExtentUnit>(wizard.landExtentUnit);
  const [condition, setCondition] = useState<LandCondition | null>(wizard.landCondition);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isValid = extent.trim() !== "" && Number(extent) > 0 && condition !== null;

  return (
    <WizardStepLayout
      step={4}
      title="Land information"
      subtitle="Tell buyers how much land is included and its terrain."
      nextDisabled={!isValid}
      onNext={async () => {
        await wizard.patch({ landExtent: extent, landExtentUnit: extentUnit, landCondition: condition! });
        router.push("/(seller)/create/nearby-places");
      }}
    >
      <Text style={styles.label}>Land Size</Text>
      <View style={styles.extentRow}>
        <View style={styles.extentInput}>
          <TextField value={extent} onChangeText={setExtent} placeholder="e.g. 20" keyboardType="numeric" />
        </View>
        <View style={styles.unitToggle}>
          {UNIT_OPTIONS.map((unit) => {
            const isSelected = extentUnit === unit.value;
            return (
              <TouchableOpacity
                key={unit.value}
                style={[styles.unitOption, isSelected && styles.unitOptionSelected]}
                onPress={() => setExtentUnit(unit.value)}
              >
                <Text style={[styles.unitOptionLabel, isSelected && styles.unitOptionLabelSelected]}>
                  {unit.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.label}>Terrain</Text>
      {CONDITION_OPTIONS.map((option) => {
        const isSelected = condition === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => setCondition(option.value)}
            activeOpacity={0.8}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionLabel}>
              {LAND_CONDITION_LABELS[option.value]}
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
  extentRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  extentInput: { flex: 1 },
  unitToggle: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: 2,
  },
  unitOption: { paddingHorizontal: spacing.sm, paddingVertical: 13, backgroundColor: colors.surface },
  unitOptionSelected: { backgroundColor: colors.primary },
  unitOptionLabel: { ...typography.caption, color: colors.textPrimary },
  unitOptionLabelSelected: { color: colors.textInverse, fontWeight: "700" },
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
  checkmark: { color: colors.primary, fontWeight: "700", fontSize: 16 },
});
