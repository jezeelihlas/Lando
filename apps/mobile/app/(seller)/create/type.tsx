import { PropertyType } from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

const OPTIONS: { value: PropertyType; label: string; description: string; icon: string }[] = [
  { value: PropertyType.LAND, label: "Land", description: "Vacant land", icon: "🌾" },
  { value: PropertyType.HOUSE, label: "House", description: "House is the primary listing", icon: "🏡" },
  {
    value: PropertyType.HOUSE_WITH_LAND,
    label: "House + Land",
    description: "House sold together with its land",
    icon: "🏠",
  },
];

export default function PropertyTypeStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [selected, setSelected] = useState<PropertyType | null>(wizard.type);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <WizardStepLayout
      step={1}
      title="What are you selling?"
      subtitle="Select exactly one property type."
      nextDisabled={!selected}
      onNext={async () => {
        if (!wizard.propertyId && selected) {
          await wizard.startNewDraft(selected);
        }
        router.push("/(seller)/create/images");
      }}
    >
      {OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => setSelected(option.value)}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{option.icon}</Text>
            <View style={styles.textCol}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  icon: { fontSize: 28, marginRight: spacing.md },
  textCol: { flex: 1 },
  optionLabel: { ...typography.h2, color: colors.textPrimary },
  optionDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
});
