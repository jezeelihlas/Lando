import { Tabs, useRouter } from "expo-router";
import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { typography, ThemeColors, useThemeColors } from "../../src/theme";
import { useAuth } from "../../src/store/authStore";
import { useWizard } from "../../src/store/wizardStore";

interface TabIconProps {
  icon: string;
  focused: boolean;
  emphasized?: boolean;
}

function TabIcon({ icon, focused, emphasized }: TabIconProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (emphasized) {
    return (
      <View style={styles.emphasizedIconWrap}>
        <Text style={styles.emphasizedIcon}>{icon}</Text>
      </View>
    );
  }
  return <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>;
}

export default function TabsLayout() {
  const router = useRouter();
  const { status } = useAuth();
  const wizard = useWizard();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: () => <TabIcon icon="＋" focused emphasized />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (status === "authenticated") {
              wizard.reset();
              router.push("/(seller)/create/type");
            } else {
              router.push("/auth");
            }
          },
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => <TabIcon icon="🤍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
  },
  tabItem: { paddingVertical: 2 },
  tabLabel: { ...typography.captionMuted, fontWeight: "600" },
  icon: { fontSize: 22, opacity: 0.55 },
  iconFocused: { opacity: 1 },
  emphasizedIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
  },
  emphasizedIcon: { fontSize: 22, color: colors.textInverse, fontWeight: "700" },
});
