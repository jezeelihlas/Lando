import { PropertySummaryDto } from "@lando/shared";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ApiClientError } from "../../src/api/client";
import { getProperties } from "../../src/api/properties";
import { EmptyState, LoadingState, Screen } from "../../src/components";
import { PropertyCard } from "../../src/features/properties/PropertyCard";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useSearchFilters } from "../../src/store/searchFiltersStore";

type LoadState = "loading" | "ready" | "error";

export default function ExploreScreen() {
  const router = useRouter();
  const { filters, activeCount } = useSearchFilters();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [properties, setProperties] = useState<PropertySummaryDto[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadState("loading");
      }
      setErrorMessage(null);
      try {
        const result = await getProperties(filters);
        setProperties(result.items);
        setLoadState("ready");
      } catch (err) {
        setErrorMessage(err instanceof ApiClientError ? err.message : "Could not load properties.");
        setLoadState("error");
      } finally {
        setRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    // Fetch-on-mount and fetch-on-filter-change: `load` synchronously flips
    // loadState to "loading" before awaiting the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => router.push("/filters")}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterButtonText}>Filters{activeCount > 0 ? ` (${activeCount})` : ""}</Text>
        </TouchableOpacity>
      </View>

      {loadState === "loading" && <LoadingState />}

      {loadState === "error" && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loadState === "ready" && properties.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No matches"
          message="Try adjusting your filters to see more properties."
          actionLabel="Clear filters"
          onAction={() => router.push("/filters")}
        />
      )}

      {loadState === "ready" && properties.length > 0 && (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          ListHeaderComponent={<Text style={styles.resultCount}>{properties.length} properties found</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: "/property/[id]", params: { id: item.id } })}>
              <PropertyCard property={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { ...typography.displayMd, color: colors.textPrimary },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    gap: 6,
  },
  filterIcon: { fontSize: 13 },
  filterButtonText: { ...typography.bodyMedium, color: colors.textPrimary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 100 },
  errorText: { ...typography.body, color: colors.danger, textAlign: "center", marginBottom: spacing.sm },
  retryButton: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  retryButtonText: { ...typography.bodyMedium, color: colors.textPrimary },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  resultCount: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
});
