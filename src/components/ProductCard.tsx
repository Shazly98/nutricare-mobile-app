import { router } from "expo-router";
import { Bell, Plus, ShoppingBag } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottleIllustration } from "@/components/icons";
import { RemoteImage, Txt } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { colorFor, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { productBlurb, productTitle } from "@/lib/localized";
import { useToast } from "@/lib/toast";
import { discountPercent, isAvailable, type Product } from "@/lib/types";
import { colors, fonts, ltrProps, ltrStyle, shadows } from "@/theme";

export function ProductCard({ product, width, listView = false }: { product: Product; width?: number; listView?: boolean }) {
  const cart = useCart();
  const toast = useToast();
  const { t, locale } = useI18n();
  const displayName = productTitle(product, locale);
  const blurb = productBlurb(product, locale);
  const outOfStock = !isAvailable(product);
  const inCart = cart.items.find((item) => item.productId === product.id);
  const percent = discountPercent(Number(product.price), product.old_price);
  const hasDiscount = percent > 0;
  const open = () => router.navigate({ pathname: "/product/[id]", params: { id: product.id } });

  const addButton = outOfStock ? (
    <Pressable onPress={() => toast.show(t("notifyToast"), "message")} style={styles.notify} accessibilityLabel={t("notify")}>
      <Bell size={15} color="#42504e" />
    </Pressable>
  ) : (
    <Pressable onPress={() => cart.addItem(product)} style={styles.add} accessibilityLabel={t("addToCart")}>
      <Plus size={16} color={colors.white} strokeWidth={2.6} />
    </Pressable>
  );

  return (
    <View style={[styles.card, listView ? styles.cardList : null, width ? { width } : null]}>
      <Pressable onPress={open} style={listView ? styles.imageList : styles.image} accessibilityLabel={displayName}>
        <View style={styles.imagePad}>
          {product.image_url ? (
            <RemoteImage uri={product.image_url} fit="contain" style={styles.fill} />
          ) : (
            <BottleIllustration color={colorFor(product.id)} label={product.brand ?? ""} />
          )}
        </View>
        {outOfStock ? (
          <View style={styles.outBadge}>
            <Text style={styles.outText}>{t("outOfStock")}</Text>
          </View>
        ) : null}
        {hasDiscount ? (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>{`-${percent}%`}</Text>
          </View>
        ) : null}
        {listView ? null : <View style={styles.addFloat}>{addButton}</View>}
      </Pressable>

      <View style={listView ? styles.bodyList : styles.body}>
        {product.brand ? (
          <Txt numberOfLines={1} style={styles.brand}>
            {product.brand}
          </Txt>
        ) : null}
        <Pressable onPress={open}>
          <Txt numberOfLines={2} style={styles.title}>
            {displayName}
          </Txt>
        </Pressable>
        {listView && blurb ? (
          <Txt numberOfLines={2} style={styles.blurb}>
            {blurb}
          </Txt>
        ) : null}

        <View style={styles.bottom} {...ltrProps}>
          <View style={styles.prices}>
            <Text style={styles.price}>{formatPrice(Number(product.price), locale)}</Text>
            {hasDiscount ? <Text style={styles.oldPrice}>{formatPrice(Number(product.old_price), locale)}</Text> : null}
          </View>
          {listView ? addButton : inCart ? (
            <View style={styles.inBag}>
              <ShoppingBag size={11} color={colors.primary} />
              <Text style={styles.inBagText}>{inCart.quantity}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: colors.white,
    boxShadow: shadows.product,
  },
  cardList: { flexDirection: "row", minHeight: 132, width: "100%" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f7f8f5" },
  imageList: { width: 124, alignSelf: "stretch", backgroundColor: "#f7f8f5" },
  imagePad: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, padding: 14 },
  fill: { width: "100%", height: "100%" },
  saleBadge: {
    position: "absolute",
    top: 8,
    start: 8,
    borderRadius: 8,
    backgroundColor: colors.sale,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  saleText: { color: colors.white, fontFamily: fonts.body800, fontSize: 11, lineHeight: 14 },
  outBadge: {
    position: "absolute",
    top: 8,
    end: 8,
    borderRadius: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  outText: { color: colors.white, fontFamily: fonts.body800, fontSize: 10, lineHeight: 14 },
  addFloat: { position: "absolute", bottom: 8, end: 8 },
  add: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.addGreen,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.add,
  },
  notify: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e4e8e0",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { gap: 4, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 12 },
  bodyList: { flex: 1, minWidth: 0, justifyContent: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 12 },
  brand: { color: colors.mutedFg, fontFamily: fonts.body700, fontSize: 11, lineHeight: 14 },
  title: { minHeight: 36, color: colors.ink, fontFamily: fonts.body800, fontSize: 13, lineHeight: 18 },
  blurb: { color: colors.blurb, fontFamily: fonts.body500, fontSize: 12, lineHeight: 18 },
  bottom: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    ...ltrStyle,
  },
  prices: { flex: 1, gap: 1 },
  price: { color: colors.ink, fontFamily: fonts.body800, fontSize: 14, lineHeight: 20 },
  oldPrice: { color: colors.mutedFg, fontFamily: fonts.body400, fontSize: 11, textDecorationLine: "line-through" },
  inBag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 999,
    backgroundColor: colors.primary10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  inBagText: { color: colors.primary, fontFamily: fonts.body800, fontSize: 11 },
});
