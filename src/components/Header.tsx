import { router } from "expo-router";
import { ChevronDown, Search, ShoppingBag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlagEgypt, FlagUk, WhatsAppIcon } from "@/components/icons";
import { BrandLogo } from "@/components/ui";
import { buildWhatsAppLink, PHONE_DISPLAY } from "@/config/site";
import type { Locale } from "@/i18n/messages";
import { useCart } from "@/lib/cart";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { colors, fonts, ltrProps, ltrStyle } from "@/theme";

const LOCALES: { id: Locale; label: string; Flag: typeof FlagUk }[] = [
  { id: "en", label: "English", Flag: FlagUk },
  { id: "ar", label: "Arabic", Flag: FlagEgypt },
];

export const TOP_BAR_HEIGHT = 36;

function LanguageMenu() {
  const { locale, setLocale } = useI18n();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[1];

  return (
    <>
      <Pressable onPress={() => setOpen((value) => !value)} style={styles.langButton} {...ltrProps}>
        <ChevronDown size={14} color={colors.primaryFg} style={open ? { transform: [{ rotate: "180deg" }] } : undefined} />
        <Text style={styles.langText}>{current.label}</Text>
        <current.Flag />
      </Pressable>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
          <View
            {...ltrProps}
            style={[
              styles.menu,
              { top: insets.top + TOP_BAR_HEIGHT + 2 },
              locale === "en" ? { right: 16 } : { left: 16 },
            ]}
          >
            {LOCALES.map((item) => {
              const selected = item.id === locale;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setOpen(false);
                    if (!selected) void setLocale(item.id);
                  }}
                  style={[styles.menuItem, selected && styles.menuItemActive]}
                >
                  <Text style={[styles.menuText, selected && { color: colors.primary }]}>{item.label}</Text>
                  <item.Flag />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export function Header({ initialQuery = "" }: { initialQuery?: string }) {
  const { t, locale, isRTL } = useI18n();
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function submitSearch() {
    const q = query.trim();
    router.navigate({ pathname: "/products", params: q ? { q } : { q: "" } });
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topInner}>
          <Pressable onPress={() => void Linking.openURL(buildWhatsAppLink(t("waHello")))} style={styles.waLink}>
            <WhatsAppIcon size={14} color={colors.primaryFg} />
            <Text style={[styles.topText, { writingDirection: "ltr" }]}>{PHONE_DISPLAY}</Text>
          </Pressable>
          <View style={styles.ltr} {...ltrProps}>
            <LanguageMenu />
          </View>
        </View>
      </View>

      <View style={styles.nav}>
        <Pressable onPress={() => router.navigate("/")} style={styles.brand}>
          <BrandLogo size={40} />
          {width >= 400 ? <Text style={styles.brandText}>NutriCare</Text> : null}
        </Pressable>

        <View style={styles.searchWrap}>
          <Search size={16} color={colors.mutedFg} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.mutedFg}
            style={[
              styles.search,
              Platform.OS === "web" ? { textAlign: isRTL ? "right" : "left" } : null,
              { writingDirection: locale === "ar" ? "rtl" : "ltr" },
            ]}
          />
        </View>

        <Pressable onPress={cart.openCart} style={styles.cartButton} accessibilityLabel={t("openCart")}>
          <ShoppingBag size={18} color="rgba(16,31,19,0.8)" />
          {cart.count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatNumber(cart.count)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 40 },
  topBar: { backgroundColor: colors.primary },
  topInner: {
    height: TOP_BAR_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  waLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  topText: { color: colors.primaryFg, fontFamily: fonts.body800, fontSize: 11 },
  ltr: ltrStyle,
  langButton: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 6,
    ...ltrStyle,
  },
  langText: { color: colors.primaryFg, fontFamily: fonts.body800, fontSize: 11 },
  menu: {
    position: "absolute",
    width: 160,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
    ...ltrStyle,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItemActive: { backgroundColor: "#f3faf0" },
  menuText: { color: "#1A2421", fontFamily: fonts.body700, fontSize: 13 },
  nav: {
    height: 64,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: colors.headerLine,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { color: colors.primary, fontFamily: fonts.display900, fontSize: 18 },
  searchWrap: { flex: 1, minWidth: 0, justifyContent: "center" },
  searchIcon: { position: "absolute", start: 12, zIndex: 1 },
  search: {
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.searchLine,
    backgroundColor: colors.searchBg,
    paddingStart: 36,
    paddingEnd: 12,
    fontSize: 14,
    fontFamily: fonts.body400,
    color: colors.foreground,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.searchLine,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    end: -4,
    height: 20,
    minWidth: 20,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.primaryFg, fontFamily: fonts.body800, fontSize: 10 },
});
