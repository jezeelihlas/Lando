import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { deletePropertyImage, reorderPropertyImages, uploadPropertyImages } from "../../../src/api/images";
import { resolveImageUrl } from "../../../src/features/properties/resolveImageUrl";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useAuth } from "../../../src/store/authStore";
import { useWizard } from "../../../src/store/wizardStore";

export default function ImagesStep() {
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
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 0.8,
        });

    if (result.canceled || result.assets.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await uploadPropertyImages(
        accessToken,
        wizard.propertyId,
        result.assets.map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        }))
      );
      wizard.setImages([...wizard.images, ...uploaded].sort((a, b) => a.sortOrder - b.sortOrder));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(imageId: string) {
    if (!accessToken || !wizard.propertyId) return;
    await deletePropertyImage(accessToken, wizard.propertyId, imageId);
    wizard.setImages(wizard.images.filter((img) => img.id !== imageId));
  }

  async function handleSetPrimary(imageId: string) {
    if (!accessToken || !wizard.propertyId) return;
    const order = wizard.images.map((img) => img.id);
    const updated = await reorderPropertyImages(accessToken, wizard.propertyId, order, imageId);
    wizard.setImages(updated);
  }

  return (
    <WizardStepLayout
      step={2}
      title="Add photos"
      subtitle="Upload clear, real photos of the property. The first photo is your primary listing photo."
      nextDisabled={wizard.images.length === 0}
      onNext={() => router.push("/(seller)/create/road-info")}
    >
      <View style={styles.grid}>
        {wizard.images.map((image) => (
          <View key={image.id} style={styles.thumbnailWrap}>
            <Image source={{ uri: resolveImageUrl(image.storageKey) }} style={styles.thumbnail} />
            {image.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
            <View style={styles.thumbnailActions}>
              {!image.isPrimary && (
                <TouchableOpacity onPress={() => handleSetPrimary(image.id)}>
                  <Text style={styles.thumbnailActionText}>Set primary</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleRemove(image.id)}>
                <Text style={[styles.thumbnailActionText, styles.removeText]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addTile} onPress={() => pickAndUpload(false)} disabled={uploading}>
          {uploading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.addTileIcon}>＋</Text>}
          <Text style={styles.addTileLabel}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cameraButton} onPress={() => pickAndUpload(true)} disabled={uploading}>
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.cameraButtonText}>Take a Photo</Text>
      </TouchableOpacity>
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  thumbnailWrap: { width: "47%" },
  thumbnail: { width: "100%", aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  primaryBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  primaryBadgeText: { ...typography.captionMuted, color: colors.textInverse, fontWeight: "700" },
  thumbnailActions: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xxs },
  thumbnailActionText: { ...typography.caption, color: colors.textPrimary },
  removeText: { color: colors.danger },
  addTile: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  addTileIcon: { fontSize: 26, color: colors.primary },
  addTileLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  cameraIcon: { fontSize: 16 },
  cameraButtonText: { ...typography.bodyMedium, color: colors.textPrimary },
});
