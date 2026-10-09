import { useRef, type ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TAB_BAR_HEIGHT } from "@/components/MobileTabBar";
import { colors } from "@/theme";

/** Store shell: compact header, scrolling content, optional checkout dock above the tab bar. */
export function SiteScreen({
  children,
  background = colors.background,
  contentStyle,
  initialQuery,
  onEndReached,
  refreshing,
  onRefresh,
  showFooter = false,
  bottomBar,
}: {
  children: ReactNode;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  initialQuery?: string;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  showFooter?: boolean;
  bottomBar?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const lastFire = useRef(0);
  const dockSpace = bottomBar ? 76 : 0;

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!onEndReached) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distance = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distance < 900 && Date.now() - lastFire.current > 600) {
      lastFire.current = Date.now();
      onEndReached();
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header initialQuery={initialQuery} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + dockSpace + 12 }}
        keyboardShouldPersistTaps="handled"
        onScroll={onEndReached ? onScroll : undefined}
        scrollEventThrottle={onEndReached ? 120 : undefined}
        refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        <View style={[{ backgroundColor: background }, contentStyle]}>{children}</View>
        {showFooter ? <Footer /> : null}
      </ScrollView>
      {bottomBar ? <View style={[styles.dock, { bottom: TAB_BAR_HEIGHT + insets.bottom }]}>{bottomBar}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.headerLine,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 30,
  },
});
