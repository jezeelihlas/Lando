import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button, Screen, TextField } from "../../src/components";
import { spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useAuth } from "../../src/store/authStore";
import { ApiClientError } from "../../src/api/client";

export default function EmailEntryScreen() {
  const router = useRouter();
  const { requestOtp } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && email.trim().length > 0;

  async function handleContinue() {
    setError(null);
    setLoading(true);
    try {
      await requestOtp(email.trim());
      router.push({ pathname: "/auth/otp", params: { email: email.trim(), name: name.trim() } });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Network error — check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.container}>
        <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>You need to verify your email before adding a property.</Text>

        <TextField
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
          autoFocus
        />

        <TextField
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
        />

        <Button label="Send Code" onPress={handleContinue} loading={loading} disabled={!isValid} size="lg" />
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  logo: { width: 64, height: 64, marginBottom: spacing.md, borderRadius: 14 },
  title: { ...typography.displayMd, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
});
