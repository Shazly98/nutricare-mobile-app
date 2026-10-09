import { router } from "expo-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SiteScreen } from "@/components/SiteScreen";
import { RemoteImage, Txt } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { formatNumber, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { cartItemTitle } from "@/lib/localized";
import { colors, endAlign, fonts, text } from "@/theme";

export default function CartScreen() {
  const cart = useCart();
  const { t, locale, isRTL } = useI18n();
  const hasItems = cart.hydrated && cart.items.length > 0;

  const dock = hasItems ? (
    <View style={styles.dock}>
      <View style={{ flex: 1 }}>
        <Text style={styles.dockLabel}>{t("total")}</Text>
        <Text style={styles.dockTotal}>{formatPrice(cart.subtotal, locale)}</Text>
        {cart.savings > 0 ? <Text style={styles.dockSave}>{t("youSaved", { amount: formatPrice(cart.savings, locale) })}</Text> : null}
      </View>
      <Pressable onPress={() => router.navigate("/checkout")} style={styles.checkout}>
        <Text style={styles.checkoutText}>{t("checkout")}</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <SiteScreen bottomBar={dock}>
      <View style={styles.page}>
        <Txt style={styles.h1}>{t("cartTitle")}</Txt>
        <Txt style={styles.sub}>{hasItems ? t("cartCount", { count: cart.count }) : t("reviewCart")}</Txt>

        {!cart.hydrated ? (
          <Txt style={[styles.sub, { marginTop: 40, textAlign: "center" }]}>{t("loadingCart")}</Txt>
        ) : cart.items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <ShoppingBag size={28} color={colors.primary} />
            </View>
            <Txt style={styles.emptyTitle}>{t("cartEmpty")}</Txt>
            <Pressable onPress={() => router.navigate("/products")} style={styles.browse}>
              <Text style={styles.browseText}>{t("browse")}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 16, gap: 10 }}>
            {cart.items.map((item) => (
              <View key={item.productId} style={styles.item}>
                <View style={styles.thumb}>
                  {item.imageUrl ? <RemoteImage uri={item.imageUrl} fit="contain" style={styles.fill} /> : null}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.itemTop}>
                    <View style={{ flex: 1 }}>
                      <Txt numberOfLines={2} style={styles.itemTitle}>
                        {cartItemTitle(item, locale)}
                      </Txt>
                      {item.brand ? <Txt style={styles.brand}>{item.brand}</Txt> : null}
                    </View>
                    <Pressable onPress={() => cart.removeItem(item.productId)} style={styles.trash} accessibilityLabel={t("delete")}>
                      <Trash2 size={15} color={colors.destructive} />
                    </Pressable>
                  </View>
                  <View style={styles.itemBottom}>
                    <View style={styles.stepper}>
                      <Pressable onPress={() => cart.updateQty(item.productId, item.quantity - 1)} style={styles.stepBtn}>
                        <Minus size={14} color={colors.ink} />
                      </Pressable>
                      <Text style={styles.qty}>{formatNumber(item.quantity)}</Text>
                      <Pressable onPress={() => cart.updateQty(item.productId, item.quantity + 1)} style={styles.stepBtn}>
                        <Plus size={14} color={colors.ink} />
                      </Pressable>
                    </View>
                    <Txt style={[styles.linePrice, { textAlign: endAlign(isRTL) }]}>
                      {formatPrice(item.price * item.quantity, locale)}
                    </Txt>
                  </View>
                </View>
              </View>
            ))}
            <Txt style={styles.note}>{t("shippingNote")}</Txt>
            <Pressable onPress={() => router.navigate("/products")}>
              <Text style={styles.continue}>{t("continueShopping")}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  h1: { color: colors.ink, fontFamily: fonts.display800, fontSize: 22, lineHeight: 30 },
  sub: { marginTop: 4, color: colors.mutedFg, ...text.sm },
  empty: {
    marginTop: 28,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary10, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 16, fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  browse: { marginTop: 16, borderRadius: 12, backgroundColor: colors.addGreen, paddingHorizontal: 18, paddingVertical: 10 },
  browseText: { color: colors.white, fontFamily: fonts.body800, fontSize: 14 },
  item: { flexDirection: "row", gap: 12, borderRadius: 16, backgroundColor: colors.white, padding: 12 },
  thumb: { width: 84, height: 84, overflow: "hidden", borderRadius: 12, backgroundColor: "#f7f8f5" },
  fill: { width: "100%", height: "100%" },
  itemTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  itemTitle: { fontFamily: fonts.body800, fontSize: 14, lineHeight: 20 },
  brand: { marginTop: 2, color: colors.mutedFg, ...text.xs },
  trash: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.destructive10, alignItems: "center", justifyContent: "center" },
  itemBottom: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, backgroundColor: colors.canvas, padding: 3 },
  stepBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 18, textAlign: "center", color: colors.ink, fontFamily: fonts.body800, fontSize: 14 },
  linePrice: { flexShrink: 1, color: colors.ink, fontFamily: fonts.body800, fontSize: 14 },
  note: { color: colors.mutedFg, fontSize: 12, lineHeight: 18 },
  continue: { color: colors.primary, fontFamily: fonts.body800, fontSize: 14 },
  dock: { flexDirection: "row", alignItems: "center", gap: 12 },
  dockLabel: { color: colors.mutedFg, fontFamily: fonts.body700, fontSize: 12 },
  dockTotal: { color: colors.ink, fontFamily: fonts.body900, fontSize: 18, lineHeight: 24 },
  dockSave: { color: colors.primary, fontFamily: fonts.body700, fontSize: 11 },
  checkout: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.addGreen,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: { color: colors.white, fontFamily: fonts.body800, fontSize: 15 },
});
