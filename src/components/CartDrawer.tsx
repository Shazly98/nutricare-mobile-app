import { router, type Href } from "expo-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pill, RemoteImage, Txt } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { formatNumber, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { cartItemTitle } from "@/lib/localized";
import { colors, endAlign, fonts, shadows, text } from "@/theme";

export function CartDrawer() {
  const cart = useCart();
  const { t, locale, isRTL } = useI18n();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(cart.isOpen);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cart.isOpen) {
      setMounted(true);
      Animated.timing(progress, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setMounted(false));
    }
  }, [cart.isOpen, mounted, progress]);

  const fromLeft = isRTL;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [fromLeft ? -width : width, 0] });

  const go = (href: Href) => {
    cart.closeCart();
    router.navigate(href);
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={cart.closeCart} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={cart.closeCart} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { paddingTop: insets.top, transform: [{ translateX }] }]}>
        <View style={styles.head}>
          <Pressable onPress={cart.closeCart} style={styles.close} accessibilityLabel={t("closeCart")}>
            <X size={16} color={colors.foreground} />
          </Pressable>
          <View>
            <Txt style={styles.title}>{t("cartTitle")}</Txt>
            <Txt style={styles.count}>{t("cartCount", { count: cart.count })}</Txt>
          </View>
        </View>

        {cart.items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <ShoppingBag size={28} color={colors.primary} />
            </View>
            <Txt style={styles.emptyTitle}>{t("cartEmpty")}</Txt>
            <Txt style={styles.emptyHint}>{t("cartEmptyHint")}</Txt>
            <Pill
              label={t("browse")}
              onPress={() => go("/products")}
              style={{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, alignSelf: "center", boxShadow: "none" }}
            />
          </View>
        ) : (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list}>
              {cart.items.map((item) => (
                <View key={item.productId} style={styles.item}>
                  <View style={styles.thumb}>
                    {item.imageUrl ? (
                      <RemoteImage uri={item.imageUrl} fit="contain" style={styles.fill} />
                    ) : (
                      <Text style={styles.fallback}>{t("productFallback")}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.itemTop}>
                      <View style={{ flex: 1 }}>
                        <Txt numberOfLines={2} style={styles.itemTitle}>
                          {cartItemTitle(item, locale)}
                        </Txt>
                        {item.brand ? <Txt style={styles.brand}>{item.brand}</Txt> : null}
                      </View>
                      <Pressable
                        onPress={() => cart.removeItem(item.productId)}
                        style={styles.trash}
                        accessibilityLabel={t("removeItem")}
                      >
                        <Trash2 size={14} color={colors.destructive} />
                      </Pressable>
                    </View>
                    <View style={styles.itemBottom}>
                      <View style={styles.stepper}>
                        <Pressable
                          onPress={() => cart.updateQty(item.productId, item.quantity - 1)}
                          style={styles.stepBtn}
                          accessibilityLabel={t("decQty")}
                        >
                          <Minus size={12} color={colors.foreground} />
                        </Pressable>
                        <Text style={styles.qty}>{formatNumber(item.quantity)}</Text>
                        <Pressable
                          onPress={() => cart.updateQty(item.productId, item.quantity + 1)}
                          style={styles.stepBtn}
                          accessibilityLabel={t("incQty")}
                        >
                          <Plus size={12} color={colors.foreground} />
                        </Pressable>
                      </View>
                      <View>
                        <Txt style={[styles.linePrice, { textAlign: endAlign(isRTL) }]}>
                          {formatPrice(item.price * item.quantity, locale)}
                        </Txt>
                        {item.oldPrice && item.oldPrice > item.price ? (
                          <Txt style={[styles.saved, { textAlign: endAlign(isRTL) }]}>
                            {t("youSaved", { amount: formatPrice((item.oldPrice - item.price) * item.quantity, locale) })}
                          </Txt>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.foot, { paddingBottom: 20 + insets.bottom }]}>
              {cart.savings > 0 ? (
                <View style={styles.row}>
                  <Text style={styles.savingText}>{t("savingOnOrder")}</Text>
                  <Text style={styles.savingText}>{formatPrice(cart.savings, locale)}</Text>
                </View>
              ) : null}
              <View style={styles.row}>
                <Text style={styles.totalText}>{t("total")}</Text>
                <Text style={[styles.totalText, { color: colors.primary }]}>{formatPrice(cart.subtotal, locale)}</Text>
              </View>
              <Txt style={styles.note}>{t("shippingNote")}</Txt>
              <Pill full label={t("checkoutWith", { amount: formatPrice(cart.subtotal, locale) })} onPress={() => go("/checkout")} style={styles.footBtn} />
              <Pill full variant="outline" label={t("viewCart")} onPress={() => go("/cart")} style={styles.footBtnPlain} />
              <Pressable onPress={cart.closeCart}>
                <Text style={styles.continue}>{t("continueShopping")}</Text>
              </Pressable>
            </View>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: "rgba(0,0,0,0.8)" },
  sheet: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  close: { width: 36, height: 36, borderRadius: 999, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display900, ...text.xl },
  count: { color: colors.mutedFg, ...text.sm },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 24 },
  emptyIcon: { width: 64, height: 64, borderRadius: 999, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  emptyHint: { color: colors.mutedFg, ...text.sm, textAlign: "center" },
  list: { gap: 16, paddingHorizontal: 20, paddingVertical: 20 },
  item: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
  },
  thumb: { width: 80, height: 80, overflow: "hidden", borderRadius: 12, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
  fill: { width: "100%", height: "100%" },
  fallback: { color: colors.mutedFg, fontFamily: fonts.body400, ...text.xs },
  itemTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  itemTitle: { fontFamily: fonts.display800, ...text.sm },
  brand: { color: colors.mutedFg, fontSize: 11, lineHeight: 16 },
  trash: { width: 32, height: 32, borderRadius: 999, backgroundColor: colors.destructive10, alignItems: "center", justifyContent: "center" },
  itemBottom: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, backgroundColor: colors.secondary, paddingHorizontal: 6, paddingVertical: 4 },
  stepBtn: { width: 28, height: 28, borderRadius: 999, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 20, textAlign: "center", color: colors.foreground, fontFamily: fonts.body800, ...text.sm },
  linePrice: { fontFamily: fonts.body800, ...text.sm },
  saved: { color: colors.primary, fontSize: 11, lineHeight: 16 },
  foot: { gap: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 20, paddingTop: 20 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  savingText: { color: colors.primary, fontFamily: fonts.body700, ...text.sm },
  totalText: { color: colors.foreground, fontFamily: fonts.body900, ...text.base },
  note: { color: colors.mutedFg, fontSize: 11, lineHeight: 16 },
  footBtn: { paddingVertical: 12, paddingHorizontal: 16, boxShadow: shadows.soft },
  footBtnPlain: { paddingVertical: 12, paddingHorizontal: 16 },
  continue: { color: colors.mutedFg, fontFamily: fonts.body700, ...text.sm, textAlign: "center" },
});
