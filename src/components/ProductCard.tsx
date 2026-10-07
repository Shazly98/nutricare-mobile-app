import { router } from "expo-router";
import { Bell, Minus, Plus, ShoppingBag } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottleIllustration } from "@/components/icons";
import { RemoteImage, Txt } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { colorFor, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { productBlurb, productTitle } from "@/lib/localized";
import { useToast } from "@/lib/toast";
import { isAvailable, type Product } from "@/lib/types";
import { colors, fonts, ltrProps, ltrStyle, shadows } from "@/theme";

export function ProductCard({ product, width, listView = false }: { product: Product; width?: number; listView?: boolean }) {
  const cart = useCart();
  const toast = useToast();
  const { t, locale } = useI18n();
  const displayName = productTitle(product, locale);
  const blurb = productBlurb(product, locale);
  const outOfStock = !isAvailable(product);
  const inCart = cart.items.find((item) => item.productId === product.id);
  const hasDiscount = Boolean(product.old_price && Number(product.old_price) > Number(product.price));
  const open = () => router.navigate({ pathname: "/product/[id]", params: { id: product.id } });

  return (
    <View style={[styles.card, listView ? styles.cardList : null, width ? { width } : null]}>
      {outOfStock ? (
        <View style={styles.outBadge}>
          <Text style={styles.outText}>{t("outOfStock")}</Text>
        </View>
      ) : null}
      <View style={styles.brandBadge}>
        <Text style={styles.brandText}>{product.brand || "NOW"}</Text>
      </View>

      <Pressable onPress={open} style={listView ? styles.imageList : styles.image} accessibilityLabel={displayName}>
        <View style={styles.imagePad}>
          {product.image_url ? (
            <RemoteImage uri={product.image_url} fit="contain" style={styles.fill} />
          ) : (
            <BottleIllustration color={colorFor(product.id)} label={product.brand ?? ""} />
          )}
        </View>
      </Pressable>

      <View style={listView ? styles.bodyList : styles.body}>
        <Pressable onPress={open}>
          <Txt numberOfLines={2} style={listView ? styles.titleList : styles.title}>
            {displayName}
          </Txt>
        </Pressable>
        {blurb ? (
          <Txt numberOfLines={2} style={listView ? styles.blurbList : styles.blurb}>
            {blurb}
          </Txt>
        ) : null}

        <View style={styles.bottom} {...ltrProps}>
          <View style={styles.prices}>
            <Text style={[styles.price, listView && { fontSize: 14 }]}>{formatPrice(Number(product.price), locale)}</Text>
            {hasDiscount ? <Text style={styles.oldPrice}>{formatPrice(Number(product.old_price), locale)}</Text> : null}
          </View>

          {outOfStock ? (
            <Pressable onPress={() => toast.show(t("notifyToast"), "message")} style={styles.notify}>
              <Bell size={12} color="#42504e" />
              <Text style={styles.notifyText}>{t("notify")}</Text>
            </Pressable>
          ) : inCart ? (
            <View style={styles.stepper}>
              <Pressable
                onPress={() => cart.updateQty(product.id, inCart.quantity - 1)}
                style={[styles.stepBtn, { backgroundColor: colors.white }]}
                accessibilityLabel={t("decQty")}
              >
                <Minus size={12} color={colors.primary} />
              </Pressable>
              <Text style={styles.stepQty}>{inCart.quantity}</Text>
              <Pressable
                onPress={() => cart.updateQty(product.id, inCart.quantity + 1)}
                style={[styles.stepBtn, { backgroundColor: colors.addGreen }]}
                accessibilityLabel={t("incQty")}
              >
                <Plus size={12} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => cart.addItem(product)} style={styles.add}>
              <ShoppingBag size={12} color={colors.white} />
              <Text style={styles.addText}>{t("addToCart")}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.cardLine,
    backgroundColor: colors.white,
    boxShadow: shadows.product,
  },
  cardList: { flexDirection: "row", minHeight: 156, width: "100%" },
  outBadge: {
    position: "absolute",
    top: 12,
    end: 12,
    zIndex: 10,
    borderRadius: 999,
    backgroundColor: colors.destructive,
    paddingHorizontal: 10,
    paddingVertical: 4,
    boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1)",
  },
  outText: { color: colors.white, fontFamily: fonts.body800, fontSize: 10, lineHeight: 14 },
  brandBadge: {
    position: "absolute",
    top: 12,
    start: 12,
    zIndex: 10,
    borderRadius: 999,
    backgroundColor: colors.brandBadgeBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  brandText: { color: colors.brandBadgeFg, fontFamily: fonts.body900, fontSize: 11, lineHeight: 14 },
  image: { width: "100%", aspectRatio: 1.14, backgroundColor: colors.white },
  imageList: { width: 150, alignSelf: "stretch", backgroundColor: colors.white },
  imagePad: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, padding: 12 },
  fill: { width: "100%", height: "100%" },
  body: { flex: 1, gap: 6, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 8 },
  bodyList: { flex: 1, minWidth: 0, gap: 4, paddingHorizontal: 12, paddingBottom: 10, paddingTop: 32 },
  title: { minHeight: 38.4, color: colors.title, fontFamily: fonts.display800, fontSize: 15, lineHeight: 20.6 },
  titleList: { color: colors.title, fontFamily: fonts.display800, fontSize: 13, lineHeight: 18 },
  blurb: { color: colors.blurb, fontFamily: fonts.body500, fontSize: 12, lineHeight: 19.5 },
  blurbList: { color: colors.blurb, fontFamily: fonts.body500, fontSize: 11, lineHeight: 18 },
  bottom: {
    marginTop: "auto",
    paddingTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    ...ltrStyle,
  },
  prices: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: 6 },
  price: { color: colors.priceGreen, fontFamily: fonts.body800, fontSize: 16, lineHeight: 24 },
  oldPrice: { color: colors.mutedFg, fontFamily: fonts.body400, fontSize: 11, textDecorationLine: "line-through" },
  add: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.addGreen,
    paddingHorizontal: 12,
    boxShadow: shadows.add,
  },
  addText: { color: colors.white, fontFamily: fonts.body800, fontSize: 11 },
  notify: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e4e8e0",
    backgroundColor: "#f3f4f1",
    paddingHorizontal: 12,
  },
  notifyText: { color: "#42504e", fontFamily: fonts.body800, fontSize: 11 },
  stepper: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary30,
    backgroundColor: colors.primary5,
    paddingHorizontal: 6,
  },
  stepBtn: { width: 24, height: 24, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  stepQty: { minWidth: 20, textAlign: "center", color: colors.foreground, fontFamily: fonts.body800, fontSize: 12 },
});
