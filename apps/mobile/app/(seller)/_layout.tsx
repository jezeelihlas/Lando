import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/store/authStore";

// Guards every route in this group: only an authenticated seller may enter
// (Rule 12 — only sellers need auth, and only for seller actions).
export default function SellerLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === "guest") {
    return <Redirect href="/auth" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
