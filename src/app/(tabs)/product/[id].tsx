import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Minus, Plus, ShoppingBag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { HtmlBlock } from "@/components/HtmlBlock";
import { BottleIllustration, WhatsAppIcon } from "@/components/icons";
import { SiteScreen } from "@/components/SiteScreen";
import { Breadcrumb, DashedBox, Pill, RemoteImage, Txt } from "@/components/ui";
import { buildWhatsAppLink } from "@/config/site";
import { useCart } from "@/lib/cart";
import { usePublicCategories, usePublicProduct } from "@/lib/catalog";
import { colorFor, formatNumber, formatPrice, plainFromHtml } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { categoryTitle, productFullHtml, productShortText, productTitle } from "@/lib/localized";
import { isAvailable } from "@/lib/types";
import { colors, fonts, shadows, text } from "@/theme";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productQuery = usePublicProduct(id);
  const categories = usePublicCategories();
  const cart = useCart();
  const { t, locale } = useI18n();
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

  return (
    <SiteScreen refreshing={productQuery.isRefetching} onRefresh={() => void productQuery.refetch()}>
      <View style={styles.page}>
        <Breadcrumb
          items={[
            { label: t("navHome"), href: "/" },
            { label: t("navProducts"), href: "/products" },
            { label: listName || t("productDetails") },
          ]}
        />

        {productQuery.isLoading ? (
          <DashedBox style={{ marginTop: 40 }}>
            <Txt style={styles.muted}>{t("loadingProduct")}</Txt>
          </DashedBox>
        ) : null}

        {!productQuery.isLoading && !product ? (
          <DashedBox style={{ marginTop: 40 }}>
            <Txt style={styles.missing}>{t("productMissing")}</Txt>
            <Pill
              label={t("backToProducts")}
              onPress={() => router.navigate("/products")}
              style={{ marginTop: 16, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, boxShadow: "none" }}
            />
          </DashedBox>
        ) : null}

        {product ? (
          <View style={{ marginTop: 32, gap: 32 }}>
            <View style={styles.imageCard}>
              <LinearGradient
                colors={[`${color}55`, colors.card]}
                start={{ x: 0.33, y: 0 }}
                end={{ x: 0.67, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {outOfStock ? (
                <View style={styles.outBadge}>
                  <Text style={styles.outText}>{t("outOfStock")}</Text>
                </View>
              ) : null}
              <View style={{ aspectRatio: 1 }}>
                {product.image_url ? (
                  <RemoteImage uri={product.image_url} fit="contain" style={{ width: "100%", height: "100%" }} />
                ) : (
                  <BottleIllustration color={color} label={product.brand ?? ""} />
                )}
              </View>
            </View>

            <View style={{ gap: 16 }}>
              {catName ? <Txt style={styles.cat}>{catName}</Txt> : null}
              <Txt style={styles.title}>{listName}</Txt>
              {otherName && otherName !== listName ? <Txt style={styles.other}>{otherName}</Txt> : null}
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

              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(Number(product.price), locale)}</Text>
                {product.old_price && Number(product.old_price) > Number(product.price) ? (
                  <Text style={styles.oldPrice}>{formatPrice(Number(product.old_price), locale)}</Text>
                ) : null}
              </View>

              <View style={styles.note}>
                <Txt style={styles.noteText}>
                  <Text style={styles.noteStrong}>{t("usageNote")}</Text> {t("usageBody")}
                </Txt>
              </View>

              <View style={styles.actions}>
                <View style={styles.stepper}>
                  <Pressable onPress={() => setQty((v) => Math.max(1, v - 1))} style={styles.stepBtn} accessibilityLabel={t("decQty")}>
                    <Minus size={16} color={colors.foreground} />
                  </Pressable>
                  <Text style={styles.qty}>{formatNumber(qty)}</Text>
                  <Pressable
                    onPress={() => setQty((v) => Math.min(product.stock_qty ?? v + 1, v + 1))}
                    style={styles.stepBtn}
                    accessibilityLabel={t("incQty")}
                  >
                    <Plus size={16} color={colors.foreground} />
                  </Pressable>
                </View>
                <Pill
                  label={outOfStock ? t("outOfStock") : t("addToCart")}
                  icon={<ShoppingBag size={16} color={colors.primaryFg} />}
                  disabled={outOfStock}
                  onPress={() => cart.addItem(product, qty)}
                />
                <Pill
                  variant="outlinePrimary"
                  label={t("waAsk")}
                  icon={<WhatsAppIcon size={16} color={colors.primary} />}
                  onPress={() =>
                    void Linking.openURL(buildWhatsAppLink(t("productWa", { name: listName, price: Number(product.price) })))
                  }
                  style={{ paddingHorizontal: 20 }}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingVertical: 40 },
  muted: { color: colors.mutedFg, ...text.base, textAlign: "center" },
  missing: { fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  imageCard: {
    overflow: "hidden",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 32,
    boxShadow: shadows.card,
  },
  outBadge: {
    position: "absolute",
    top: 16,
    end: 16,
    zIndex: 10,
    borderRadius: 999,
    backgroundColor: "rgba(238,54,47,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    boxShadow: shadows.card,
  },
  outText: { color: colors.white, fontFamily: fonts.body800, ...text.xs },
  cat: { color: colors.primary, fontFamily: fonts.body700, ...text.xs },
  title: { fontFamily: fonts.display900, fontSize: 30, lineHeight: 40 },
  other: { color: "rgba(16,31,19,0.85)", fontFamily: fonts.body800, ...text.lg },
  meta: { color: colors.mutedFg, ...text.sm },
  short: { color: "rgba(16,31,19,0.8)", ...text.sm, lineHeight: 23 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 12 },
  price: { color: colors.primary, fontFamily: fonts.body900, ...text["2xl"] },
  oldPrice: { color: colors.mutedFg, ...text.sm, fontFamily: fonts.body400, textDecorationLine: "line-through" },
  note: { borderRadius: 16, borderWidth: 1, borderColor: colors.destructive20, backgroundColor: colors.destructive5, padding: 16 },
  noteText: { color: "rgba(16,31,19,0.8)", ...text.xs, lineHeight: 19.5 },
  noteStrong: { color: colors.destructive, fontFamily: fonts.body700 },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 24, textAlign: "center", color: colors.foreground, fontFamily: fonts.body800, ...text.base },
});
