import { router } from "expo-router";
import { ChevronDown, Search, ShoppingBag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlagEgypt, FlagUk } from "@/components/icons";
import { BrandLogo } from "@/components/ui";
import type { Locale } from "@/i18n/messages";
import { useCart } from "@/lib/cart";
import { formatNumber } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { colors, fonts, ltrProps, ltrStyle } from "@/theme";

const LOCALES: { id: Locale; label: string; Flag: typeof FlagUk }[] = [
  { id: "en", label: "English", Flag: FlagUk },
  { id: "ar", label: "Arabic", Flag: FlagEgypt },
];

function LanguageMenu() {
  const { locale, setLocale } = useI18n();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[1];

  return (
    <>
      <Pressable onPress={() => setOpen((value) => !value)} style={styles.langButton} accessibilityLabel={current.label} {...ltrProps}>
        <current.Flag />
        <ChevronDown size={12} color={colors.ink} style={open ? { transform: [{ rotate: "180deg" }] } : undefined} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
          <View
            {...ltrProps}
            style={[styles.menu, { top: insets.top + 52 }, locale === "en" ? { right: 16 } : { left: 16 }]}
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
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function submitSearch() {
    const q = query.trim();
    router.navigate({ pathname: "/products", params: q ? { q } : { q: "" } });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={() => router.navigate("/")} style={styles.brand} accessibilityLabel="NutriCare">
          <BrandLogo size={34} />
          <Text style={styles.brandText}>NutriCare</Text>
        </Pressable>
        <View style={styles.actions}>
          <LanguageMenu />
          <Pressable onPress={() => router.navigate("/cart")} style={styles.cartButton} accessibilityLabel={t("openCart")}>
            <ShoppingBag size={20} color={colors.ink} />
            {cart.count > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatNumber(cart.count)}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Search size={16} color={colors.mutedFg} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerLine,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  top: { height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { color: colors.primary, fontFamily: fonts.display800, fontSize: 18 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  langButton: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    paddingHorizontal: 8,
    ...ltrStyle,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    end: -4,
    height: 18,
    minWidth: 18,
    borderRadius: 999,
    backgroundColor: colors.sale,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontFamily: fonts.body800, fontSize: 10 },
  searchWrap: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    paddingHorizontal: 12,
  },
  search: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.body500,
    color: colors.foreground,
    padding: 0,
  },
  menu: {
    position: "absolute",
    width: 160,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
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
  menuText: { color: colors.ink, fontFamily: fonts.body700, fontSize: 13 },
});
