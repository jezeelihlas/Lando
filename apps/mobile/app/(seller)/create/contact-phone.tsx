import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useWizard } from "../../../src/store/wizardStore";

const SL_MOBILE_REGEX = /^\+947\d{8}$/;

export default function ContactPhoneStep() {
  const router = useRouter();
  const wizard = useWizard();
  const [contactPhoneNumber, setContactPhoneNumber] = useState(wizard.contactPhoneNumber || "+947");
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isValid = SL_MOBILE_REGEX.test(contactPhoneNumber);

  return (
    <WizardStepLayout
      step={10}
      title="Contact number"
      subtitle="Buyers will use this number to contact you about this listing. No verification code needed."
      nextDisabled={!isValid}
      onNext={async () => {
        await wizard.patch({ contactPhoneNumber });
        router.push("/(seller)/create/preview");
      }}
    >
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={contactPhoneNumber}
          onChangeText={setContactPhoneNumber}
          placeholder="+94771234567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={12}
          autoFocus
        />
      </View>
      {!isValid && contactPhoneNumber.length > 4 && (
        <Text style={styles.hint}>Enter a valid Sri Lankan mobile number (+947XXXXXXXX)</Text>
      )}
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  inputWrap: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  input: { paddingVertical: 15, fontSize: 18, fontWeight: "600", color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
});
