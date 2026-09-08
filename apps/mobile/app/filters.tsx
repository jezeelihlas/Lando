import {
  LandCondition,
  MARKETPLACE_REGION,
  NEARBY_PLACE_META,
  NearbyPlaceType,
  PropertySearchFilters,
  PropertyType,
} from "@lando/shared";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Screen, TextField } from "../src/components";
import { FilterChip } from "../src/components/FilterChip";
import { LAND_CONDITION_LABELS, PROPERTY_TYPE_LABELS } from "../src/features/properties/labels";
import { spacing, typography, ThemeColors, useThemeColors } from "../src/theme";
import { useSearchFilters } from "../src/store/searchFiltersStore";

export default function FiltersScreen() {
  const router = useRouter();
  const { filters, setFilters } = useSearchFilters();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [type, setType] = useState<PropertyType | undefined>(filters.type);
  const [landCondition, setLandCondition] = useState<LandCondition | undefined>(filters.landCondition);
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() ?? "");
  const [roadWidthMin, setRoadWidthMin] = useState(filters.roadWidthMin?.toString() ?? "");
  const [nearby, setNearby] = useState<NearbyPlaceType[]>(filters.nearby ?? []);
  const [town, setTown] = useState<string | undefined>(filters.town);

  function toggleNearby(t: NearbyPlaceType) {
    setNearby((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleApply() {
    const next: PropertySearchFilters = {
      type,
      landCondition,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      roadWidthMin: roadWidthMin ? Number(roadWidthMin) : undefined,
      nearby: nearby.length > 0 ? nearby : undefined,
      town,
    };
    setFilters(next);
    router.back();
  }

  function handleClear() {
    setFilters({});
    router.back();
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerLink}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={[styles.headerLink, styles.headerLinkAccent]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Property Type</Text>
        <View style={styles.chipRow}>
          {(Object.values(PropertyType) as PropertyType[]).map((t) => (
            <FilterChip
              key={t}
              label={PROPERTY_TYPE_LABELS[t]}
              selected={type === t}
              onPress={() => setType(type === t ? undefined : t)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Price Range (LKR)</Text>
        <View style={styles.row}>
          <View style={styles.rowField}>
            <TextField value={priceMin} onChangeText={setPriceMin} placeholder="Min" keyboardType="numeric" />
          </View>
          <View style={styles.rowField}>
            <TextField value={priceMax} onChangeText={setPriceMax} placeholder="Max" keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Land Condition</Text>
        <View style={styles.chipRow}>
          {(Object.values(LandCondition) as LandCondition[]).map((c) => (
            <FilterChip
              key={c}
              icon={c === "FLAT" ? "🌱" : "⛰️"}
              label={LAND_CONDITION_LABELS[c]}
              selected={landCondition === c}
              onPress={() => setLandCondition(landCondition === c ? undefined : c)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Minimum Road Width (ft)</Text>
        <TextField value={roadWidthMin} onChangeText={setRoadWidthMin} placeholder="e.g. 15" keyboardType="numeric" />

        <Text style={styles.sectionTitle}>Nearby Facilities</Text>
        <View style={styles.chipRow}>
          {NEARBY_PLACE_META.map((meta) => (
            <FilterChip
              key={meta.type}
              icon={meta.icon}
              label={meta.label}
              selected={nearby.includes(meta.type)}
              onPress={() => toggleNearby(meta.type)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Nearest Town</Text>
        <View style={styles.chipRow}>
          {MARKETPLACE_REGION.towns.map((t) => (
            <FilterChip
              key={t.name}
              label={t.name}
              selected={town === t.name}
              onPress={() => setTown(town === t.name ? undefined : t.name)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Apply Filters" onPress={handleApply} size="lg" />
      </View>
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
  headerTitle: { ...typography.h1, color: colors.textPrimary },
  headerLink: { ...typography.body, color: colors.textSecondary },
  headerLinkAccent: { color: colors.danger },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  sectionTitle: { ...typography.overline, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  rowField: { flex: 1 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
