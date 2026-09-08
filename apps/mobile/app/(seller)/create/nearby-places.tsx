import { NearbyPlaceType, NEARBY_PLACE_META } from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

export default function NearbyPlacesStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [selected, setSelected] = useState<NearbyPlaceType[]>(wizard.selectedNearbyTypes);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function toggle(type: NearbyPlaceType) {
    setSelected((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  return (
    <WizardStepLayout
      step={5}
      title="Nearby facilities"
      subtitle="Select which facilities are near this property. Distances are calculated automatically once you set the exact location."
      onNext={async () => {
        wizard.setSelectedNearbyTypes(selected);
        router.push("/(seller)/create/deed");
      }}
    >
      <View style={styles.grid}>
        {NEARBY_PLACE_META.map((meta) => {
          const isSelected = selected.includes(meta.type);
          return (
            <TouchableOpacity
              key={meta.type}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggle(meta.type)}
              activeOpacity={0.8}
            >
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              )}
              <Text style={styles.cardIcon}>{meta.icon}</Text>
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  card: {
    width: "31%",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadgeText: { color: colors.textInverse, fontSize: 10, fontWeight: "700" },
  cardIcon: { fontSize: 24, marginBottom: spacing.xxs },
  cardLabel: { ...typography.captionMuted, color: colors.textSecondary, textAlign: "center" },
  cardLabelSelected: { color: colors.textPrimary, fontWeight: "700" },
});
