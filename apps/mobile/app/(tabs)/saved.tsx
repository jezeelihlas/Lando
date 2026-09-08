import { PropertyDetailDto } from "@lando/shared";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getPropertyDetail } from "../../src/api/properties";
import { EmptyState, LoadingState, Screen } from "../../src/components";
import { PropertyCard } from "../../src/features/properties/PropertyCard";
import { spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useFavorites } from "../../src/store/favoritesStore";

export default function SavedScreen() {
  const router = useRouter();
  const { favoriteIds } = useFavorites();
  const [properties, setProperties] = useState<PropertyDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Re-fetch every time the tab gains focus (not just on mount) so
  // removing a favorite elsewhere, or from this screen's own heart button,
  // is reflected immediately when the user comes back to this tab.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      if (favoriteIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      Promise.all(favoriteIds.map((id) => getPropertyDetail(id).catch(() => null)))
        .then((results) => {
          if (cancelled) return;
          setProperties(results.filter((p): p is PropertyDetailDto => p !== null));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [favoriteIds])
  );

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        {properties.length > 0 && <Text style={styles.count}>{properties.length} properties</Text>}
      </View>

      {loading ? (
        <LoadingState />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="🤍"
          title="No saved properties"
          message="Tap the heart on any listing to save it here."
          actionLabel="Browse properties"
          onAction={() => router.push("/")}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.displayMd, color: colors.textPrimary },
  count: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
