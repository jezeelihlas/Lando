import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { Button } from "../../../src/components";
import { uploadPropertyDeed } from "../../../src/api/deeds";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useAuth } from "../../../src/store/authStore";
import { useWizard } from "../../../src/store/wizardStore";

export default function DeedStep() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const wizard = useWizard();
  const [uploading, setUploading] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function pickAndUpload(fromCamera: boolean) {
    if (!accessToken || !wizard.propertyId) return;

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });

    if (result.canceled || result.assets.length === 0) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      await uploadPropertyDeed(accessToken, wizard.propertyId, {
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      wizard.setDeedUploaded(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <WizardStepLayout
      step={6}
      title="Deed document"
      subtitle="Upload a clear photo of the property deed. This is used only for duplicate-listing detection — it is never shown to buyers and is not legal ownership verification."
      nextDisabled={!wizard.deedUploaded}
      onNext={() => router.push("/(seller)/create/price")}
    >
      {wizard.deedUploaded ? (
        <View style={styles.uploadedBox}>
          <Text style={styles.uploadedIcon}>✓</Text>
          <Text style={styles.uploadedText}>Deed Uploaded</Text>
          <Text style={styles.uploadedSubtext}>Document submitted for review</Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📄</Text>
          <Text style={styles.placeholderText}>No deed uploaded yet</Text>
        </View>
      )}

      {uploading && <ActivityIndicator color={colors.primary} style={styles.spinner} />}

      <Button
        label={wizard.deedUploaded ? "Replace with Gallery Photo" : "Choose from Gallery"}
        onPress={() => pickAndUpload(false)}
        disabled={uploading}
      />
      <View style={styles.gap} />
      <Button
        label={wizard.deedUploaded ? "Retake Photo" : "Take Photo"}
        variant="outline"
        onPress={() => pickAndUpload(true)}
        disabled={uploading}
      />
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  placeholder: {
    height: 150,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  placeholderIcon: { fontSize: 32, marginBottom: spacing.xs, opacity: 0.5 },
  placeholderText: { ...typography.body, color: colors.textMuted },
  uploadedBox: {
    height: 150,
    backgroundColor: colors.successBg,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  uploadedIcon: { fontSize: 28, color: colors.success, marginBottom: 4 },
  uploadedText: { ...typography.h1, color: colors.success },
  uploadedSubtext: { ...typography.caption, color: colors.success, marginTop: 2 },
  spinner: { marginBottom: spacing.md },
  gap: { height: spacing.sm },
});
