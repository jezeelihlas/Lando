import { formatLKR } from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

export default function PriceStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [price, setPrice] = useState(wizard.price);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const numericPrice = Number(price);
  const isValid = price.trim() !== "" && numericPrice > 0;

  return (
    <WizardStepLayout
      step={7}
      title="Asking price"
      subtitle="Enter the price in Sri Lankan Rupees (LKR)."
      nextDisabled={!isValid}
      onNext={async () => {
        await wizard.patch({ price });
        router.push("/(seller)/create/description");
      }}
    >
      <View style={styles.inputWrap}>
        <Text style={styles.prefix}>Rs.</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ""))}
          placeholder="8,500,000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          autoFocus
        />
      </View>
      {isValid && <Text style={styles.preview}>{formatLKR(numericPrice)}</Text>}
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  prefix: { ...typography.h1, color: colors.textSecondary, marginRight: spacing.xs },
  input: { flex: 1, paddingVertical: 15, fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  preview: { ...typography.bodyMedium, color: colors.secondary, marginTop: spacing.sm },
});
