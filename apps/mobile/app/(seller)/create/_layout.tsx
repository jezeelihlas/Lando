import { Stack } from "expo-router";

export default function CreateWizardLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />;
}
