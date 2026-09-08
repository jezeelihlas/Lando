import { MARKETPLACE_REGION, NearbyPlaceCandidateDto, NEARBY_PLACE_META } from "@lando/shared";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WizardStepLayout } from "../../../src/features/wizard/WizardStepLayout";
import { MapPicker } from "../../../src/features/wizard/MapPicker";
import { nearbySearch, reverseGeocode } from "../../../src/api/maps";
import { setPropertyNearbyPlaces } from "../../../src/api/nearbyPlaces";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../../src/theme";
import { useAuth } from "../../../src/store/authStore";
import { useWizard } from "../../../src/store/wizardStore";

type Phase = "location" | "nearby";

export default function LocationStep() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const wizard = useWizard();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [phase, setPhase] = useState<Phase>("location");
  const [latitude, setLatitude] = useState(wizard.latitude ?? MARKETPLACE_REGION.center.latitude);
  const [longitude, setLongitude] = useState(wizard.longitude ?? MARKETPLACE_REGION.center.longitude);
  const [displayName, setDisplayName] = useState<string | null>(wizard.locationDisplayName);

  const [candidatesByType, setCandidatesByType] = useState<Record<string, NearbyPlaceCandidateDto[]>>({});
  const [chosenByType, setChosenByType] = useState<Record<string, string>>({});
  const [resolvingNearby, setResolvingNearby] = useState(false);

  useEffect(() => {
    if (wizard.latitude !== null) return;
    // Best-effort: centers the map on the device's current location if
    // permission is granted, otherwise it just starts at the Kandy center.
    Location.requestForegroundPermissionsAsync().then(async (permission) => {
      if (!permission.granted) return;
      const position = await Location.getCurrentPositionAsync({});
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirmLocation() {
    if (!accessToken || !wizard.propertyId) throw new Error("No active draft");

    const geocode = await reverseGeocode(accessToken, latitude, longitude).catch(() => ({ displayName: null }));
    setDisplayName(geocode.displayName);
    await wizard.setLocation(latitude, longitude, geocode.displayName);

    if (wizard.selectedNearbyTypes.length === 0) {
      router.push("/(seller)/create/contact-phone");
      return;
    }

    setResolvingNearby(true);
    try {
      const results = await Promise.all(
        wizard.selectedNearbyTypes.map((type) => nearbySearch(accessToken, latitude, longitude, type))
      );
      const byType: Record<string, NearbyPlaceCandidateDto[]> = {};
      const defaultChosen: Record<string, string> = {};
      wizard.selectedNearbyTypes.forEach((type, i) => {
        byType[type] = results[i];
        if (results[i].length > 0) defaultChosen[type] = results[i][0].id;
      });
      setCandidatesByType(byType);
      setChosenByType(defaultChosen);
      setPhase("nearby");
    } finally {
      setResolvingNearby(false);
    }
  }

  async function handleConfirmNearby() {
    if (!accessToken || !wizard.propertyId) throw new Error("No active draft");

    const selections = wizard.selectedNearbyTypes
      .filter((type) => chosenByType[type])
      .map((type) => ({ type, nearbyPlaceId: chosenByType[type] }));

    const saved = await setPropertyNearbyPlaces(accessToken, wizard.propertyId, selections);
    wizard.setNearbyPlaceSelections(saved);
    router.push("/(seller)/create/preview");
  }

  if (phase === "nearby") {
    return (
      <WizardStepLayout
        step={9}
        title="Confirm nearby places"
        subtitle="We found these matches near your property. Choose the correct one if more than one option exists."
        onNext={handleConfirmNearby}
      >
        {wizard.selectedNearbyTypes.map((type) => {
          const meta = NEARBY_PLACE_META.find((m) => m.type === type);
          const candidates = candidatesByType[type] ?? [];
          return (
            <View key={type} style={styles.nearbySection}>
              <Text style={styles.nearbySectionTitle}>
                {meta?.icon} {meta?.label}
              </Text>
              {candidates.length === 0 ? (
                <Text style={styles.noneFoundText}>None found nearby — this category will be skipped.</Text>
              ) : (
                candidates.map((candidate) => (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[styles.candidate, chosenByType[type] === candidate.id && styles.candidateSelected]}
                    onPress={() => setChosenByType((prev) => ({ ...prev, [type]: candidate.id }))}
                  >
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <Text style={styles.candidateDistance}>{candidate.distanceMeters} m</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          );
        })}
      </WizardStepLayout>
    );
  }

  return (
    <WizardStepLayout
      step={9}
      title="Exact location"
      subtitle="Drag the pin or tap the map to set the exact property location."
      nextLabel={resolvingNearby ? "Resolving nearby places…" : "Confirm Location"}
      nextDisabled={resolvingNearby}
      onNext={handleConfirmLocation}
    >
      <MapPicker
        latitude={latitude}
        longitude={longitude}
        onLocationChange={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
      />
      <View style={styles.locationInfo}>
        <Text style={styles.coordsText}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
        {displayName && <Text style={styles.addressText}>{displayName}</Text>}
      </View>
      {resolvingNearby && <ActivityIndicator color={colors.primary} style={styles.spinner} />}
    </WizardStepLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  locationInfo: { marginTop: spacing.md, alignItems: "center" },
  coordsText: { ...typography.caption, color: colors.textMuted },
  addressText: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 4, textAlign: "center" },
  spinner: { marginTop: spacing.md },
  nearbySection: { marginBottom: spacing.lg },
  nearbySectionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  noneFoundText: { ...typography.caption, color: colors.textMuted },
  candidate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  candidateSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  candidateName: { ...typography.body, color: colors.textPrimary },
  candidateDistance: { ...typography.caption, color: colors.textSecondary },
});
