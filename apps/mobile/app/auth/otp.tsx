import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Screen, TextField } from "../../src/components";
import { spacing, typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useAuth } from "../../src/store/authStore";
import { ApiClientError } from "../../src/api/client";

const RESEND_COOLDOWN_SECONDS = 60;

export default function OtpEntryScreen() {
  const router = useRouter();
  const { email, name } = useLocalSearchParams<{ email: string; name: string }>();
  const { confirmOtp, requestOtp } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify() {
    setError(null);
    setLoading(true);
    try {
      await confirmOtp(email, code, name);
      router.replace("/(seller)");
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

  async function handleResend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      await requestOtp(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not resend code.");
    }
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>We sent a code to {email}</Text>

        <TextField
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          error={error}
          style={styles.codeInput}
        />

        <Button label="Verify" onPress={handleVerify} loading={loading} disabled={code.length < 4} size="lg" />

        <TouchableOpacity style={styles.resend} onPress={handleResend} disabled={cooldown > 0}>
          <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  icon: { fontSize: 40, marginBottom: spacing.md },
  title: { ...typography.displayMd, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  codeInput: { fontSize: 22, letterSpacing: 6, textAlign: "center" },
  resend: { marginTop: spacing.lg, alignItems: "center" },
  resendText: { ...typography.bodyMedium, color: colors.primary },
  resendDisabled: { color: colors.textMuted },
});
