import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/store/authStore";

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Redirect href="/(seller)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
