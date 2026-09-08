import { formatDistance, formatLandExtent, formatLKR, NEARBY_PLACE_META, PropertyDetailDto } from "@lando/shared";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ApiClientError } from "../../src/api/client";
import { getPropertyDetail } from "../../src/api/properties";
import { Badge, Button, IconButton, LoadingState, Screen } from "../../src/components";
import {
  LAND_CONDITION_LABELS,
  PROPERTY_TYPE_LABELS,
  ROAD_ACCESS_LABELS,
} from "../../src/features/properties/labels";
import { PropertyMapView } from "../../src/features/properties/PropertyMapView";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useFavorites } from "../../src/store/favoritesStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GALLERY_HEIGHT = 320;

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [property, setProperty] = useState<PropertyDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryRef = useRef<FlatList>(null);

  useEffect(() => {
    let cancelled = false;
    getPropertyDetail(id)
      .then((data) => {
        if (!cancelled) setProperty(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Could not load this property.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Go back" variant="outline" fullWidth={false} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (!property) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const favorited = isFavorite(property.id);
  const images = property.images.length > 0 ? property.images : null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          {images ? (
            <FlatList
              ref={galleryRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(img) => img.id}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActiveImageIndex(index);
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={styles.galleryImage} resizeMode="cover" />
              )}
            />
          ) : (
            <View style={[styles.galleryImage, styles.galleryFallback]}>
              <Text style={styles.galleryFallbackIcon}>🏞️</Text>
            </View>
          )}

          {images && images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          <View style={styles.galleryTopBar}>
            <IconButton icon="←" onPress={() => router.back()} />
            <IconButton icon={favorited ? "❤️" : "🤍"} onPress={() => toggleFavorite(property.id)} />
          </View>
        </View>

        <View style={styles.content}>
          <Badge label={`${PROPERTY_TYPE_LABELS[property.type].toUpperCase()} FOR SALE`} variant="solid" />

          <Text style={styles.price}>{formatLKR(property.price)}</Text>
          <Text style={styles.location}>📍 Kandy, Sri Lanka</Text>

          <View style={styles.specsGrid}>
            <SpecItem icon="📐" label="Land Size" value={formatLandExtent(property.landExtent, property.landExtentUnit)} />
            <SpecItem
              icon="🛣️"
              label="Road Access"
              value={`${property.roadWidth} ${property.roadWidthUnit === "FEET" ? "ft" : "m"}`}
            />
            <SpecItem
              icon={property.landCondition === "FLAT" ? "🌱" : "⛰️"}
              label="Terrain"
              value={LAND_CONDITION_LABELS[property.landCondition]}
            />
            <SpecItem icon="🚧" label="Access Type" value={ROAD_ACCESS_LABELS[property.roadAccess]} />
          </View>

          <Section title="Description">
            <Text style={styles.bodyText}>{property.description}</Text>
          </Section>

          {property.nearbyPlaces.length > 0 && (
            <Section title="Nearby Places">
              <View style={styles.nearbyGrid}>
                {property.nearbyPlaces.map((place, index) => {
                  const meta = NEARBY_PLACE_META.find((m) => m.type === place.type);
                  return (
                    <View key={`${place.type}-${index}`} style={styles.nearbyChip}>
                      <Text style={styles.nearbyIcon}>{meta?.icon ?? "📍"}</Text>
                      <View>
                        <Text style={styles.nearbyLabel}>{meta?.label ?? place.type}</Text>
                        <Text style={styles.nearbyDistance}>{formatDistance(place.distanceMeters)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Section>
          )}

          <Section title="Location">
            <PropertyMapView latitude={property.latitude} longitude={property.longitude} />
          </Section>

          <Section title="Seller">
            <View style={styles.sellerRow}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>📞</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerLabel}>Contact number</Text>
                <Text style={styles.sellerPhone}>{property.sellerPhoneNumber}</Text>
              </View>
            </View>
          </Section>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <View style={styles.stickyFooterPrice}>
          <Text style={styles.stickyFooterPriceLabel}>Price</Text>
          <Text style={styles.stickyFooterPriceValue}>{formatLKR(property.price)}</Text>
        </View>
        <View style={styles.stickyFooterButton}>
          <Button
            label="Call Seller"
            icon={<Text style={styles.callIcon}>📞</Text>}
            onPress={() => Linking.openURL(`tel:${property.sellerPhoneNumber}`)}
          />
        </View>
      </View>
    </View>
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

function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.specItem}>
      <Text style={styles.specIcon}>{icon}</Text>
      <View>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 120 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.xl },
  errorText: { ...typography.body, color: colors.danger, textAlign: "center" },
  gallery: { height: GALLERY_HEIGHT, backgroundColor: colors.surfaceAlt },
  galleryImage: { width: SCREEN_WIDTH, height: GALLERY_HEIGHT },
  galleryFallback: { alignItems: "center", justifyContent: "center" },
  galleryFallbackIcon: { fontSize: 56, opacity: 0.35 },
  galleryTopBar: {
    position: "absolute",
    top: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageCounter: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    backgroundColor: "rgba(20,20,18,0.6)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  imageCounterText: { ...typography.caption, color: colors.textInverse },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  price: { ...typography.priceXl, color: colors.textPrimary, marginTop: spacing.sm },
  location: { ...typography.bodyLg, color: colors.textSecondary, marginTop: 2 },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    width: "47%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  specIcon: { fontSize: 20 },
  specLabel: { ...typography.captionMuted, color: colors.textMuted },
  specValue: { ...typography.bodyMedium, color: colors.textPrimary },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  bodyText: { ...typography.bodyLg, color: colors.textPrimary, lineHeight: 24 },
  nearbyGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  nearbyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  nearbyIcon: { fontSize: 18 },
  nearbyLabel: { ...typography.caption, color: colors.textPrimary },
  nearbyDistance: { ...typography.captionMuted, color: colors.textSecondary },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerAvatarText: { fontSize: 20 },
  sellerInfo: { flex: 1 },
  sellerLabel: { ...typography.captionMuted, color: colors.textMuted },
  sellerPhone: { ...typography.h2, color: colors.textPrimary, marginTop: 2 },
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  stickyFooterPrice: { flex: 1 },
  stickyFooterPriceLabel: { ...typography.captionMuted, color: colors.textMuted },
  stickyFooterPriceValue: { ...typography.h1, color: colors.textPrimary },
  stickyFooterButton: { flex: 1.2 },
  callIcon: { fontSize: 15 },
});
