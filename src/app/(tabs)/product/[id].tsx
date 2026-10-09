import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { HtmlBlock } from "@/components/HtmlBlock";
import { BottleIllustration, WhatsAppIcon } from "@/components/icons";
import { SiteScreen } from "@/components/SiteScreen";
import { DashedBox, RemoteImage, Txt } from "@/components/ui";
import { buildWhatsAppLink } from "@/config/site";
import { useCart } from "@/lib/cart";
import { usePublicCategories, usePublicProduct } from "@/lib/catalog";
import { colorFor, formatNumber, formatPrice, plainFromHtml } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { categoryTitle, productFullHtml, productShortText, productTitle } from "@/lib/localized";
import { discountPercent, isAvailable } from "@/lib/types";
import { colors, fonts, text } from "@/theme";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productQuery = usePublicProduct(id);
  const categories = usePublicCategories();
  const cart = useCart();
  const { t, locale, isRTL } = useI18n();
  const [qty, setQty] = useState(1);
  const product = productQuery.data;

  useEffect(() => {
    setQty(1);
  }, [id]);

  const color = product ? colorFor(product.id) : "#7AB87A";
  const category = categories.data?.find((c) => c.id === product?.category_id);
  const catName = category ? categoryTitle(category, locale) : "";
  const listName = product ? productTitle(product, locale) : "";
  const otherName = product && locale === "en" ? product.name_ar.trim() : product?.name_en?.trim() || "";
  const fullHtml = product ? productFullHtml(product, locale) : "";
  const shortOnly = product ? productShortText(product, locale) : "";
  const outOfStock = product ? !isAvailable(product) : false;
  const percent = product ? discountPercent(Number(product.price), product.old_price) : 0;
  const Back = isRTL ? ChevronRight : ChevronLeft;

  const dock = product ? (
    <View style={styles.dock}>
      <View style={styles.stepper}>
        <Pressable onPress={() => setQty((v) => Math.max(1, v - 1))} style={styles.stepBtn} accessibilityLabel={t("decQty")}>
          <Minus size={16} color={colors.ink} />
        </Pressable>
        <Text style={styles.qty}>{formatNumber(qty)}</Text>
        <Pressable
          onPress={() => setQty((v) => Math.min(product.stock_qty ?? v + 1, v + 1))}
          style={styles.stepBtn}
          accessibilityLabel={t("incQty")}
        >
          <Plus size={16} color={colors.ink} />
        </Pressable>
      </View>
      <Pressable
        disabled={outOfStock}
        onPress={() => cart.addItem(product, qty)}
        style={[styles.buy, outOfStock && { opacity: 0.45 }]}
      >
        <Text style={styles.buyLabel}>{outOfStock ? t("outOfStock") : t("addToCart")}</Text>
        <Text style={styles.buyPrice}>{formatPrice(Number(product.price) * qty, locale)}</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <SiteScreen refreshing={productQuery.isRefetching} onRefresh={() => void productQuery.refetch()} bottomBar={dock}>
      <View style={styles.page}>
        {productQuery.isLoading ? (
          <DashedBox style={{ marginTop: 40, marginHorizontal: 16 }}>
            <Txt style={styles.muted}>{t("loadingProduct")}</Txt>
          </DashedBox>
        ) : null}

        {!productQuery.isLoading && !product ? (
          <DashedBox style={{ marginTop: 40, marginHorizontal: 16 }}>
            <Txt style={styles.missing}>{t("productMissing")}</Txt>
            <Pressable onPress={() => router.navigate("/products")} style={styles.backLink}>
              <Text style={styles.backLinkText}>{t("backToProducts")}</Text>
            </Pressable>
          </DashedBox>
        ) : null}

        {product ? (
          <View>
            <View style={styles.imageCard}>
              <LinearGradient
                colors={[`${color}33`, "#f7f8f5"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel={t("navProducts")}>
                <Back size={20} color={colors.ink} />
              </Pressable>
              {percent > 0 ? (
                <View style={styles.saleBadge}>
                  <Text style={styles.saleText}>{`-${percent}%`}</Text>
                </View>
              ) : null}
              {outOfStock ? (
                <View style={styles.outBadge}>
                  <Text style={styles.outText}>{t("outOfStock")}</Text>
                </View>
              ) : null}
              <View style={{ aspectRatio: 1, padding: 28 }}>
                {product.image_url ? (
                  <RemoteImage uri={product.image_url} fit="contain" style={{ width: "100%", height: "100%" }} />
                ) : (
                  <BottleIllustration color={color} label={product.brand ?? ""} />
                )}
              </View>
            </View>

            <View style={styles.info}>
              {catName ? <Txt style={styles.cat}>{catName}</Txt> : null}
              <Txt style={styles.title}>{listName}</Txt>
              {otherName && otherName !== listName ? <Txt style={styles.other}>{otherName}</Txt> : null}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(Number(product.price), locale)}</Text>
                {product.old_price && Number(product.old_price) > Number(product.price) ? (
                  <Text style={styles.oldPrice}>{formatPrice(Number(product.old_price), locale)}</Text>
                ) : null}
              </View>
              {product.brand ? (
                <Txt style={styles.meta}>
                  {t("brandLabel")}: {product.brand}
                </Txt>
              ) : null}
              {product.size ? (
                <Txt style={styles.meta}>
                  {t("sizeLabel")}: {product.size}
                </Txt>
              ) : null}
              {shortOnly && shortOnly !== plainFromHtml(fullHtml) ? <Txt style={styles.short}>{shortOnly}</Txt> : null}
              {fullHtml ? <HtmlBlock html={fullHtml} /> : null}
              <View style={styles.note}>
                <Txt style={styles.noteText}>
                  <Text style={styles.noteStrong}>{t("usageNote")}</Text> {t("usageBody")}
                </Txt>
              </View>
              <Pressable
                onPress={() =>
                  void Linking.openURL(buildWhatsAppLink(t("productWa", { name: listName, price: Number(product.price) })))
                }
                style={styles.wa}
              >
                <WhatsAppIcon size={16} color={colors.primary} />
                <Text style={styles.waText}>{t("waAsk")}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: 8 },
  muted: { color: colors.mutedFg, ...text.base, textAlign: "center" },
  missing: { fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  backLink: { marginTop: 16, alignSelf: "center", borderRadius: 12, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10 },
  backLinkText: { color: colors.white, fontFamily: fonts.body800, fontSize: 14 },
  imageCard: { overflow: "hidden", backgroundColor: "#f7f8f5", aspectRatio: 1 },
  backBtn: {
    position: "absolute",
    top: 12,
    start: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  saleBadge: {
    position: "absolute",
    top: 12,
    end: 12,
    zIndex: 10,
    borderRadius: 8,
    backgroundColor: colors.sale,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saleText: { color: colors.white, fontFamily: fonts.body800, fontSize: 12 },
  outBadge: {
    position: "absolute",
    top: 56,
    end: 12,
    zIndex: 10,
    borderRadius: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  outText: { color: colors.white, fontFamily: fonts.body800, ...text.xs },
  info: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  cat: { color: colors.primary, fontFamily: fonts.body700, ...text.xs },
  title: { fontFamily: fonts.display800, fontSize: 22, lineHeight: 30 },
  other: { color: colors.mutedFg, fontFamily: fonts.body700, ...text.sm },
  meta: { color: colors.mutedFg, ...text.sm },
  short: { color: colors.ink, ...text.sm, lineHeight: 23 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  price: { color: colors.ink, fontFamily: fonts.body900, fontSize: 22, lineHeight: 28 },
  oldPrice: { color: colors.mutedFg, ...text.sm, fontFamily: fonts.body400, textDecorationLine: "line-through" },
  note: { borderRadius: 14, backgroundColor: colors.destructive5, padding: 14 },
  noteText: { color: "rgba(16,31,19,0.8)", ...text.xs, lineHeight: 19.5 },
  noteStrong: { color: colors.destructive, fontFamily: fonts.body700 },
  wa: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary30,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  waText: { color: colors.primary, fontFamily: fonts.body800, fontSize: 14 },
  dock: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 22, textAlign: "center", color: colors.ink, fontFamily: fonts.body800, fontSize: 15 },
  buy: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.addGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  buyLabel: { color: colors.white, fontFamily: fonts.body800, fontSize: 15 },
  buyPrice: { color: colors.white, fontFamily: fonts.body800, fontSize: 15 },
});
