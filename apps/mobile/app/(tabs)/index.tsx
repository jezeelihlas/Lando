import { MARKETPLACE_REGION, PropertySummaryDto, PropertyType } from "@lando/shared";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ApiClientError } from "../../src/api/client";
import { getProperties } from "../../src/api/properties";
import { EmptyState, LoadingState, Screen, SectionHeader } from "../../src/components";
import { PropertyCard } from "../../src/features/properties/PropertyCard";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useSearchFilters } from "../../src/store/searchFiltersStore";

type LoadState = "loading" | "ready" | "error";

const CATEGORIES: { label: string; icon: string; type?: PropertyType }[] = [
  { label: "All", icon: "🗺️" },
  { label: "Land", icon: "🌾", type: "LAND" },
  { label: "House", icon: "🏡", type: "HOUSE" },
  { label: "House + Land", icon: "🏠", type: "HOUSE_WITH_LAND" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { setFilters } = useSearchFilters();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [properties, setProperties] = useState<PropertySummaryDto[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadState("loading");
    }
    setErrorMessage(null);
    try {
      const result = await getProperties({});
      setProperties(result.items);
      setLoadState("ready");
    } catch (err) {
      setErrorMessage(err instanceof ApiClientError ? err.message : "Could not load properties.");
      setLoadState("error");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount pattern: `load` synchronously flips loadState
    // to "loading" before awaiting the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function goToCategory(type?: PropertyType) {
    setFilters(type ? { type } : {});
    router.push("/(tabs)/explore");
  }

  const recent = properties.slice(0, 6);

  if (loadState === "loading") {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={loadState === "ready" ? properties : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.brand}>Lando</Text>
                <Text style={styles.location}>📍 {MARKETPLACE_REGION.displayName}, Sri Lanka</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.searchBar} onPress={() => router.push("/(tabs)/explore")} activeOpacity={0.8}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search land, houses in Kandy...</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoriesContent}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.label} style={styles.categoryChip} onPress={() => goToCategory(cat.type)}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loadState === "error" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <TouchableOpacity onPress={() => load()}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {loadState === "ready" && recent.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Recently Added"
                  actionLabel="See all"
                  onAction={() => router.push("/(tabs)/explore")}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {recent.map((property) => (
                    <TouchableOpacity
                      key={property.id}
                      onPress={() => router.push({ pathname: "/property/[id]", params: { id: property.id } })}
                    >
                      <PropertyCard property={property} variant="horizontal" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {loadState === "ready" && properties.length > 0 && (
              <View style={[styles.section, styles.listSectionHeader]}>
                <SectionHeader title="All Listings" subtitle={`${properties.length} properties in Kandy`} />
              </View>
            )}

            {loadState === "ready" && properties.length === 0 && (
              <EmptyState
                icon="🏞️"
                title="No listings yet"
                message="Be the first to list a property in Kandy."
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: "/property/[id]", params: { id: item.id } })}>
            <PropertyCard property={item} />
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  header: { paddingTop: spacing.sm, marginBottom: spacing.md },
  brand: { ...typography.displayMd, color: colors.primary },
  location: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    marginBottom: spacing.md,
  },
  searchIcon: { fontSize: 15, marginRight: spacing.xs },
  searchPlaceholder: { ...typography.body, color: colors.textMuted },
  categories: { marginBottom: spacing.lg },
  categoriesContent: { gap: spacing.sm, paddingRight: spacing.lg },
  categoryChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 84,
  },
  categoryIcon: { fontSize: 20, marginBottom: 4 },
  categoryLabel: { ...typography.caption, color: colors.textPrimary, textAlign: "center" },
  section: { marginBottom: spacing.sm },
  listSectionHeader: { marginTop: spacing.xs },
  horizontalList: { paddingRight: spacing.lg, paddingBottom: spacing.xs },
  errorBox: { alignItems: "center", paddingVertical: spacing.lg },
  errorText: { ...typography.body, color: colors.danger, textAlign: "center", marginBottom: spacing.xs },
  retryText: { ...typography.bodyMedium, color: colors.primary },
});
