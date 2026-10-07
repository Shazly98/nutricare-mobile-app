import { router } from "expo-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SiteScreen } from "@/components/SiteScreen";
import { Pill, RemoteImage, Txt } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { formatNumber, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { cartItemTitle } from "@/lib/localized";
import { colors, endAlign, fonts, shadows, text } from "@/theme";

export default function CartScreen() {
  const cart = useCart();
  const { t, locale, isRTL } = useI18n();

  return (
    <SiteScreen>
      <View style={styles.page}>
        <Txt style={styles.h1}>{t("cartTitle")}</Txt>
        <Txt style={styles.sub}>{t("reviewCart")}</Txt>

        {!cart.hydrated ? (
          <Txt style={[styles.sub, { marginTop: 40, textAlign: "center" }]}>{t("loadingCart")}</Txt>
        ) : cart.items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <ShoppingBag size={28} color={colors.primary} />
            </View>
            <Txt style={styles.emptyTitle}>{t("cartEmpty")}</Txt>
            <Pill
              label={t("browse")}
              onPress={() => router.navigate("/products")}
              style={{ marginTop: 16, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, boxShadow: "none" }}
            />
          </View>
        ) : (
          <View style={{ marginTop: 32, gap: 24 }}>
            <View style={{ gap: 16 }}>
              {cart.items.map((item) => (
                <View key={item.productId} style={styles.item}>
                  <View style={styles.thumb}>
                    {item.imageUrl ? <RemoteImage uri={item.imageUrl} fit="contain" style={styles.fill} /> : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.itemTop}>
                      <View style={{ flex: 1 }}>
                        <Txt style={styles.itemTitle}>{cartItemTitle(item, locale)}</Txt>
                        {item.brand ? <Txt style={styles.brand}>{item.brand}</Txt> : null}
                      </View>
                      <Pressable onPress={() => cart.removeItem(item.productId)} style={styles.trash} accessibilityLabel={t("delete")}>
                        <Trash2 size={16} color={colors.destructive} />
                      </Pressable>
                    </View>
                    <View style={styles.itemBottom}>
                      <View style={styles.stepper}>
                        <Pressable onPress={() => cart.updateQty(item.productId, item.quantity - 1)} style={styles.stepBtn}>
                          <Minus size={14} color={colors.foreground} />
                        </Pressable>
                        <Text style={styles.qty}>{formatNumber(item.quantity)}</Text>
                        <Pressable onPress={() => cart.updateQty(item.productId, item.quantity + 1)} style={styles.stepBtn}>
                          <Plus size={14} color={colors.foreground} />
                        </Pressable>
                      </View>
                      <Txt style={[styles.linePrice, { textAlign: endAlign(isRTL) }]}>
                        {formatPrice(item.price * item.quantity, locale)}
                      </Txt>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.aside}>
              <Txt style={styles.asideTitle}>{t("orderSummary")}</Txt>
              <View style={{ marginTop: 20, gap: 12 }}>
                {cart.savings > 0 ? (
                  <View style={styles.row}>
                    <Text style={styles.saving}>{t("yourSaving")}</Text>
                    <Text style={styles.saving}>{formatPrice(cart.savings, locale)}</Text>
                  </View>
                ) : null}
                <View style={[styles.row, styles.totalRow]}>
                  <Text style={styles.total}>{t("total")}</Text>
                  <Text style={[styles.total, { color: colors.primary }]}>{formatPrice(cart.subtotal, locale)}</Text>
                </View>
                <Txt style={styles.note}>{t("shippingNote")}</Txt>
              </View>
              <Pill full label={t("checkout")} onPress={() => router.navigate("/checkout")} style={styles.asideBtn} />
              <Pill
                full
                variant="outline"
                label={t("continueShopping")}
                onPress={() => router.navigate("/products")}
                style={[styles.asideBtn, { marginTop: 12 }]}
              />
            </View>
          </View>
        )}
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingVertical: 40 },
  h1: { fontFamily: fonts.display900, ...text["3xl"] },
  sub: { marginTop: 8, color: colors.mutedFg, ...text.sm },
  empty: {
    marginTop: 40,
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  emptyIcon: { width: 64, height: 64, borderRadius: 999, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { marginTop: 16, fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  item: {
    flexDirection: "row",
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    boxShadow: shadows.card,
  },
  thumb: { width: 96, height: 96, overflow: "hidden", borderRadius: 16, backgroundColor: colors.secondary },
  fill: { width: "100%", height: "100%" },
  itemTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  itemTitle: { fontFamily: fonts.display800, ...text.base },
  brand: { color: colors.mutedFg, ...text.xs },
  trash: { width: 36, height: 36, borderRadius: 999, backgroundColor: colors.destructive10, alignItems: "center", justifyContent: "center" },
  itemBottom: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 4 },
  stepBtn: { width: 32, height: 32, borderRadius: 999, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 20, textAlign: "center", color: colors.foreground, fontFamily: fonts.body800, ...text.base },
  linePrice: { flexShrink: 1, fontFamily: fonts.body800, ...text.base },
  aside: { borderRadius: 32, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24, boxShadow: shadows.card },
  asideTitle: { fontFamily: fonts.display900, ...text.xl },
  row: { flexDirection: "row", justifyContent: "space-between" },
  saving: { color: colors.primary, fontFamily: fonts.body700, ...text.sm },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  total: { color: colors.foreground, fontFamily: fonts.body900, ...text.base },
  note: { color: colors.mutedFg, fontSize: 11, lineHeight: 16 },
  asideBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 20, boxShadow: "none" },
});
