import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button, EmptyState, Screen } from "../../src/components";
import { radius, spacing, typography, ThemeColors, useTheme, useThemeColors } from "../../src/theme";
import { useAuth } from "../../src/store/authStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { status, user, signOut } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (status !== "authenticated" || !user) {
    return (
      <Screen edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <EmptyState
          icon="👤"
          title="You're not signed in"
          message="Sign in with your email to manage your listings and profile."
          actionLabel="Sign in"
          onAction={() => router.push("/auth")}
        />
      </Screen>
    );
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.identityCol}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuRow icon="🏡" label="My Properties" onPress={() => router.push("/(seller)")} />
        <MenuRow icon="🤍" label="Saved Properties" onPress={() => router.push("/(tabs)/saved")} />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleIcon}>{mode === "dark" ? "🌙" : "☀️"}</Text>
          <Text style={styles.toggleLabel}>Dark Mode</Text>
          <Switch
            value={mode === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <View style={styles.signOutWrap}>
        <Button label="Sign Out" variant="outline" onPress={handleSignOut} />
      </View>
    </Screen>
  );
}

function MenuRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
    title: { ...typography.displayMd, color: colors.textPrimary },
    card: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: spacing.lg,
      backgroundColor: colors.primaryLight,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    avatarText: { color: colors.textInverse, fontWeight: "700", fontSize: 16 },
    identityCol: { flex: 1 },
    name: { ...typography.h2, color: colors.textPrimary },
    email: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
    menu: {
      marginHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIcon: { fontSize: 18, marginRight: spacing.sm },
    menuLabel: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
    menuChevron: { fontSize: 18, color: colors.textMuted },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    toggleIcon: { fontSize: 18, marginRight: spacing.sm },
    toggleLabel: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
    signOutWrap: { marginHorizontal: spacing.lg, marginTop: spacing.xl },
  });
