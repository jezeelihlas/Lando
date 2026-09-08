import { formatLKR, SellerPropertyDto } from "@lando/shared";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ApiClientError } from "../../src/api/client";
import { deactivateProperty, deleteMyProperty, getMyProperties, reactivateProperty } from "../../src/api/properties";
import { Badge, EmptyState, LoadingState, Screen } from "../../src/components";
import {
  PROPERTY_STATUS_COLORS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "../../src/features/properties/labels";
import { resolveImageUrl } from "../../src/features/properties/resolveImageUrl";
import { radius, spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useAuth } from "../../src/store/authStore";
import { useWizard } from "../../src/store/wizardStore";

export default function SellerHomeScreen() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const wizard = useWizard();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [properties, setProperties] = useState<SellerPropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    (isRefresh = false) => {
      if (!accessToken) return;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      getMyProperties(accessToken)
        .then(setProperties)
        .catch(() => undefined)
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [accessToken]
  );

  useEffect(() => {
    // Standard fetch-on-mount pattern: `load` synchronously flips
    // loading/refreshing state before awaiting the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function handleAddProperty() {
    wizard.reset();
    router.push("/(seller)/create/type");
  }

  function handleEdit(property: SellerPropertyDto) {
    wizard.loadExistingDraft(property);
    router.push("/(seller)/create/type");
  }

  async function handleDeactivate(id: string) {
    if (!accessToken) return;
    await deactivateProperty(accessToken, id).catch((err) => {
      Alert.alert("Could not deactivate", err instanceof ApiClientError ? err.message : "Please try again.");
    });
    load();
  }

  async function handleReactivate(id: string) {
    if (!accessToken) return;
    await reactivateProperty(accessToken, id).catch((err) => {
      Alert.alert("Could not reactivate", err instanceof ApiClientError ? err.message : "Please try again.");
    });
    load();
  }

  function handleDelete(id: string) {
    Alert.alert("Delete listing?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!accessToken) return;
          await deleteMyProperty(accessToken, id).catch((err) => {
            Alert.alert("Could not delete", err instanceof ApiClientError ? err.message : "Please try again.");
          });
          load();
        },
      },
    ]);
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>My Properties</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.addIconButton} onPress={handleAddProperty}>
          <Text style={styles.addIconText}>＋</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="🏡"
          title="No properties yet"
          message="You haven't listed any properties yet."
          actionLabel="+ Add Property"
          onAction={handleAddProperty}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const statusColor = PROPERTY_STATUS_COLORS[item.status];
            const primaryImage = item.images?.find((img) => img.isPrimary) ?? item.images?.[0];
            return (
              <View style={styles.card}>
                {primaryImage ? (
                  <Image source={{ uri: resolveImageUrl(primaryImage.storageKey) }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <Text style={styles.cardImagePlaceholderIcon}>🏞️</Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardPrice} numberOfLines={1}>
                      {item.price ? formatLKR(Number(item.price)) : "Draft"}
                    </Text>
                    <Badge label={PROPERTY_STATUS_LABELS[item.status]} bg={statusColor.bg} color={statusColor.text} />
                  </View>
                  <Text style={styles.cardType}>{PROPERTY_TYPE_LABELS[item.type]}</Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    {item.status === "PUBLISHED" && (
                      <TouchableOpacity onPress={() => handleDeactivate(item.id)}>
                        <Text style={styles.actionText}>Deactivate</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === "DEACTIVATED" && (
                      <TouchableOpacity onPress={() => handleReactivate(item.id)}>
                        <Text style={styles.actionText}>Reactivate</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backLink: { ...typography.bodyMedium, color: colors.textPrimary, marginRight: spacing.sm },
  headerTitleRow: { flex: 1 },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  addIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addIconText: { color: colors.textInverse, fontSize: 18, fontWeight: "700" },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  cardImage: { width: 100, height: 100, backgroundColor: colors.surfaceAlt },
  cardImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  cardImagePlaceholderIcon: { fontSize: 24, opacity: 0.4 },
  cardBody: { flex: 1, padding: spacing.sm },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.xs },
  cardPrice: { ...typography.h2, color: colors.textPrimary, flexShrink: 1 },
  cardType: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  actionText: { ...typography.caption, color: colors.textPrimary, fontWeight: "700" },
  deleteText: { color: colors.danger },
});
