import { formatLandExtent, formatLKR, PropertySummaryDto } from "@lando/shared";
import { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { radius, shadows, spacing, typography, ThemeColors, useThemeColors } from "../../theme";
import { useFavorites } from "../../store/favoritesStore";
import { LAND_CONDITION_LABELS, PROPERTY_TYPE_LABELS, ROAD_ACCESS_SHORT_LABELS } from "./labels";

interface PropertyCardProps {
  property: PropertySummaryDto;
  variant?: "vertical" | "horizontal";
}

const LAND_CONDITION_ICON: Record<string, string> = { FLAT: "🌱", SLOPED: "⛰️" };

export function PropertyCard({ property, variant = "vertical" }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);
  const isHorizontal = variant === "horizontal";
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, isHorizontal && styles.cardHorizontal]}>
      <View style={[styles.imageWrap, isHorizontal && styles.imageWrapHorizontal]}>
        {property.primaryImageUrl ? (
          <Image source={{ uri: property.primaryImageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.imageFallbackIcon}>🏞️</Text>
          </View>
        )}

        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{PROPERTY_TYPE_LABELS[property.type].toUpperCase()}</Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(property.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.favoriteIcon}>{favorited ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>

        {property.imageCount > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>📷 {property.imageCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.price} numberOfLines={1}>
          {formatLKR(property.price)}
        </Text>
        <Text style={styles.extent} numberOfLines={1}>
          {formatLandExtent(property.landExtent, property.landExtentUnit)}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 Kandy, Sri Lanka
          </Text>
        </View>

        {!isHorizontal && (
          <>
            <View style={styles.metaRow}>
              <Text style={styles.metaText} numberOfLines={1}>
                🛣️ {property.roadWidth} {property.roadWidthUnit === "FEET" ? "ft" : "m"} ·{" "}
                {ROAD_ACCESS_SHORT_LABELS[property.roadAccess]}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText} numberOfLines={1}>
                {LAND_CONDITION_ICON[property.landCondition]} {LAND_CONDITION_LABELS[property.landCondition]}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const IMAGE_HEIGHT = 190;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHorizontal: {
    flexDirection: "row",
    width: 260,
    height: 128,
    marginRight: spacing.md,
    marginBottom: 0,
  },
  imageWrap: { height: IMAGE_HEIGHT, backgroundColor: colors.surfaceAlt },
  imageWrapHorizontal: { height: undefined, width: 110 },
  image: { width: "100%", height: "100%" },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  imageFallbackIcon: { fontSize: 32, opacity: 0.4 },
  typeBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
  },
  typeBadgeText: { ...typography.overline, color: colors.textInverse },
  favoriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIcon: { fontSize: 15 },
  imageCountBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(20,20,18,0.6)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  imageCountText: { ...typography.captionMuted, color: colors.textInverse, fontWeight: "600" },
  body: { padding: spacing.md, flex: 1 },
  price: { ...typography.priceLg, color: colors.textPrimary },
  extent: { ...typography.bodyMedium, color: colors.secondary, marginTop: 2 },
  locationRow: { marginTop: spacing.xs },
  locationText: { ...typography.body, color: colors.textSecondary },
  metaRow: { marginTop: 4 },
  metaText: { ...typography.caption, color: colors.textMuted },
});
