import { useRef, type ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TAB_BAR_SPACE } from "@/components/MobileTabBar";
import { colors } from "@/theme";

/** Same shell as the site's `SiteLayout`: header, page content, footer. */
export function SiteScreen({
  children,
  background = colors.background,
  contentStyle,
  initialQuery,
  onEndReached,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  initialQuery?: string;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const lastFire = useRef(0);

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
        contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        keyboardShouldPersistTaps="handled"
        onScroll={onEndReached ? onScroll : undefined}
        scrollEventThrottle={onEndReached ? 120 : undefined}
        refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        <View style={[{ backgroundColor: background }, contentStyle]}>{children}</View>
        <Footer />
      </ScrollView>
    </View>
  );
}
