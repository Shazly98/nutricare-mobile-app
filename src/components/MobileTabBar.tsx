import { router, type Href } from "expo-router";
import { House, MessageCircle, ShoppingBag, Store, Tag, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MessageKey } from "@/i18n/messages";
import { useCart } from "@/lib/cart";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { colors, fonts } from "@/theme";

export const TAB_BAR_HEIGHT = 58;

/** Space a scrolling screen must leave so the bar never covers content. */
export const TAB_BAR_SPACE = TAB_BAR_HEIGHT;

type Tab = { key: string; href: Href; label: MessageKey; icon: LucideIcon; match: string[]; cart?: boolean };

const TABS: Tab[] = [
  { key: "home", href: "/", label: "navHome", icon: House, match: ["index"] },
  { key: "products", href: "/products", label: "navProducts", icon: Store, match: ["products", "product/[id]"] },
  { key: "cart", href: "/cart", label: "navCart", icon: ShoppingBag, match: ["cart", "checkout"], cart: true },
  { key: "offers", href: "/offers", label: "navOffers", icon: Tag, match: ["offers"] },
  { key: "contact", href: "/contact", label: "navTabContact", icon: MessageCircle, match: ["contact"] },
];

export function MobileTabBar({ state }: { state: { index: number; routes: { name: string }[] } }) {
  const { t } = useI18n();
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name ?? "index";

  return (
    <View style={[styles.root, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
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
            <View>
              <Icon size={22} color={active ? colors.primary : colors.tabIdle} strokeWidth={active ? 2.4 : 1.8} />
              {tab.cart && cart.count > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{formatNumber(cart.count)}</Text>
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={[styles.label, { color: active ? colors.primary : colors.tabIdle }]}>
              {t(tab.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.headerLine,
  },
  cell: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 },
  label: { fontFamily: fonts.body700, fontSize: 10, lineHeight: 13 },
  badge: {
    position: "absolute",
    top: -6,
    end: -10,
    height: 16,
    minWidth: 16,
    borderRadius: 999,
    backgroundColor: colors.sale,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontFamily: fonts.body800, fontSize: 9 },
});
