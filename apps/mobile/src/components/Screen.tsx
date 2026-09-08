import { StyleSheet, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../theme";

interface ScreenProps {
  children: React.ReactNode;
  edges?: readonly Edge[];
  style?: ViewStyle;
  backgroundColor?: string;
}

// Consistent safe-area + background wrapper so no screen hand-rolls its own
// paddingTop guess for the notch/status bar.
export function Screen({ children, edges = ["top"], style, backgroundColor }: ScreenProps) {
  const colors = useThemeColors();
  return (
    <SafeAreaView edges={edges} style={[styles.base, { backgroundColor: backgroundColor ?? colors.background }, style]}>
      <View style={styles.fill}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  fill: { flex: 1 },
});
