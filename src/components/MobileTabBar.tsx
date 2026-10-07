import { router, type Href } from "expo-router";
import { House, MessageCircle, Newspaper, Store, Tag, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Gradient } from "@/components/ui";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/lib/locale";
import { colors, fonts } from "@/theme";

const BAR_HEIGHT = 70;
const LIFT = 32;
const NOTCH = 40;
const CENTER = 58.4;

/** Space a scrolling screen must leave at the bottom so the bar never covers content (site: 7.5rem). */
export const TAB_BAR_SPACE = 120;

type Tab = { key: string; href: Href; label: MessageKey; icon: LucideIcon; match: string[]; center?: boolean };

const TABS: Tab[] = [
  { key: "home", href: "/", label: "navHome", icon: House, match: ["index"] },
  { key: "offers", href: "/offers", label: "navOffers", icon: Tag, match: ["offers"] },
  { key: "products", href: "/products", label: "navProducts", icon: Store, match: ["products", "product/[id]"], center: true },
  { key: "bulletin", href: "/bulletin", label: "navTabBulletin", icon: Newspaper, match: ["bulletin", "article/[slug]"] },
  { key: "contact", href: "/contact", label: "navTabContact", icon: MessageCircle, match: ["contact"] },
];

export function MobileTabBar({ state }: { state: { index: number; routes: { name: string }[] } }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const current = state.routes[state.index]?.name ?? "index";
  const cx = width / 2;
  const shape = `M0,0 H${cx - NOTCH} A${NOTCH},${NOTCH} 0 0 0 ${cx + NOTCH},0 H${width} V${BAR_HEIGHT} H0 Z`;
  const center = TABS.find((tab) => tab.center)!;

  return (
    <View style={[styles.root, { pointerEvents: "box-none" }]}>
      <View style={styles.shadow}>
        <Svg width={width} height={BAR_HEIGHT} style={styles.shape}>
          <Path d={shape} fill={colors.white} />
        </Svg>
        <View style={styles.grid}>
          {TABS.map((tab) => {
            if (tab.center) return <View key={tab.key} style={styles.cell} />;
            const active = tab.match.includes(current);
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.key}
                onPress={() => router.navigate(tab.href)}
                style={styles.cell}
                accessibilityLabel={t(tab.label)}
                accessibilityState={{ selected: active }}
              >
                <Icon size={21.6} color={active ? colors.primary : colors.tabIdle} strokeWidth={active ? 2.35 : 1.9} />
                {active ? (
                  <Text numberOfLines={1} style={styles.label}>
                    {t(tab.label)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: insets.bottom, backgroundColor: colors.white }} />
      </View>

      <Pressable
        onPress={() => router.navigate({ pathname: "/products", params: { q: "", category: "" } })}
        accessibilityLabel={t(center.label)}
        style={[styles.centerWrap, { left: cx - CENTER / 2 }]}
      >
        <Gradient style={styles.center}>
          <Store size={24} color={colors.white} strokeWidth={2.1} />
        </Gradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: LIFT,
  },
  shadow: {
    boxShadow: "0px -2px 16px 0px rgba(23,50,34,0.08)",
  },
  shape: { position: "absolute", top: 0, left: 0 },
  grid: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cell: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, height: "100%" },
  label: { color: colors.primary, fontFamily: fonts.body800, fontSize: 11, lineHeight: 12, paddingHorizontal: 2 },
  centerWrap: {
    position: "absolute",
    top: 0,
    width: CENTER,
    height: CENTER,
    borderRadius: 999,
    boxShadow: "0px 10px 22px 0px rgba(22,163,74,0.38)",
  },
  center: {
    width: CENTER,
    height: CENTER,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
