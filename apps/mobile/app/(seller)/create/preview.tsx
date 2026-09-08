import { formatDistance, formatLandExtent, formatLKR, NEARBY_PLACE_META } from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { Badge } from "../../../src/components";
import { publishProperty } from "../../../src/api/properties";
import { resolveImageUrl } from "../../../src/features/properties/resolveImageUrl";
import {
  LAND_CONDITION_LABELS,
  PROPERTY_TYPE_LABELS,
  ROAD_ACCESS_LABELS,
} from "../../../src/features/properties/labels";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useAuth } from "../../../src/store/authStore";
import { useWizard } from "../../../src/store/wizardStore";

export default function PreviewStep() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const wizard = useWizard();
  const [confirmed, setConfirmed] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const price = Number(wizard.price);

  return (
    <WizardStepLayout
      step={11}
      title="Preview & Publish"
      nextLabel="Publish Listing"
      nextDisabled={!confirmed}
      onNext={async () => {
        if (!accessToken || !wizard.propertyId) throw new Error("No active draft");
        await publishProperty(accessToken, wizard.propertyId);
        wizard.reset();
        router.replace("/(seller)");
      }}
    >
      {wizard.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {wizard.images.map((image) => (
            <Image key={image.id} source={{ uri: resolveImageUrl(image.storageKey) }} style={styles.image} />
          ))}
        </ScrollView>
      )}

      <Text style={styles.price}>{price > 0 ? formatLKR(price) : "—"}</Text>
      <View style={styles.badgeRow}>
        {wizard.type && <Badge label={PROPERTY_TYPE_LABELS[wizard.type]} />}
        {wizard.landExtent && (
          <Badge label={formatLandExtent(Number(wizard.landExtent), wizard.landExtentUnit)} />
        )}
        {wizard.landCondition && <Badge label={LAND_CONDITION_LABELS[wizard.landCondition]} />}
      </View>

      <Section title="Road access">
        <Text style={styles.bodyText}>
          {wizard.roadWidth} ft · {wizard.roadAccess ? ROAD_ACCESS_LABELS[wizard.roadAccess] : "—"}
        </Text>
      </Section>

      <Section title="Description">
        <Text style={styles.bodyText}>{wizard.description}</Text>
      </Section>

      {wizard.nearbyPlaceSelections.length > 0 && (
        <Section title="Nearby">
          {wizard.nearbyPlaceSelections.map((place, i) => {
            const meta = NEARBY_PLACE_META.find((m) => m.type === place.type);
            return (
              <View key={i} style={styles.nearbyRow}>
                <Text style={styles.nearbyLabel}>
                  {meta?.icon} {meta?.label}
                </Text>
                <Text style={styles.nearbyDistance}>{formatDistance(place.distanceMeters)}</Text>
              </View>
            );
          })}
        </Section>
      )}

      <Section title="Location">
        <Text style={styles.bodyText}>
          {wizard.locationDisplayName ?? `${wizard.latitude?.toFixed(5)}, ${wizard.longitude?.toFixed(5)}`}
        </Text>
      </Section>

      <Section title="Deed">
        <Text style={styles.bodyText}>{wizard.deedUploaded ? "✓ Deed Uploaded" : "Not uploaded"}</Text>
      </Section>

      <Section title="Seller Contact">
        <Text style={styles.bodyText}>{wizard.contactPhoneNumber}</Text>
      </Section>

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setConfirmed((c) => !c)} activeOpacity={0.8}>
        <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
          {confirmed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I understand that my phone number will be visible to buyers who view this listing.
        </Text>
      </TouchableOpacity>
    </WizardStepLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  imageRow: { marginBottom: spacing.md },
  image: { width: 200, height: 150, borderRadius: radius.md, marginRight: spacing.sm, backgroundColor: colors.surfaceAlt },
  price: { ...typography.priceLg, color: colors.textPrimary },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.overline, color: colors.textMuted, marginBottom: spacing.xs },
  bodyText: { ...typography.body, color: colors.textPrimary, lineHeight: 20 },
  nearbyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  nearbyLabel: { ...typography.body, color: colors.textPrimary },
  nearbyDistance: { ...typography.body, color: colors.textSecondary },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", marginTop: spacing.xl, gap: spacing.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.textInverse, fontSize: 14, fontWeight: "700" },
  checkboxLabel: { flex: 1, ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
});
