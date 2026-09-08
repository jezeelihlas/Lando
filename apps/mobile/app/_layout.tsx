import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/store/authStore";
import { FavoritesProvider } from "../src/store/favoritesStore";
import { SearchFiltersProvider } from "../src/store/searchFiltersStore";
import { WizardProvider } from "../src/store/wizardStore";
import { ThemeProvider, useTheme } from "../src/theme";

// Keep the native splash (logo on black, configured in app.json) visible
// past the JS bundle load, through session restore in AuthProvider —
// otherwise it disappears before we know guest vs. authenticated and the
// app flashes blank before the initial redirect.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ThemedStack() {
  const { mode } = useTheme();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "loading") {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [status]);

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <SearchFiltersProvider>
              <WizardProvider>
                <ThemedStack />
              </WizardProvider>
            </SearchFiltersProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
