import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLink, Eyebrow, RemoteImage, Txt } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { pickText } from "@/lib/localized";
import { requireSupabase } from "@/lib/supabase";
import { useToast } from "@/lib/toast";
import { discountPercent, isAvailable, type Product } from "@/lib/types";
import { colors, fonts, shadows, text } from "@/theme";

function useStartOffer(offer: Product) {
  const { t } = useI18n();
  const cart = useCart();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const startOrder = async () => {
    setPending(true);
    try {
      const { data, error } = await requireSupabase()
        .from("products")
        .select("*")
        .eq("id", offer.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      const product = data as Product | null;
      if (!product || !isAvailable(product)) {
        toast.show(t("unavailable"), "error");
        return;
      }
      cart.addItem(product);
      cart.closeCart();
      router.navigate("/checkout");
    } catch (error) {
      toast.show(error instanceof Error ? error.message : t("unavailable"), "error");
    } finally {
      setPending(false);
    }
  };

  return { pending, startOrder };
}

function offerText(offer: Product, locale: "ar" | "en") {
  return {
    title: pickText(locale, offer.name_ar, offer.name_en),
    description: pickText(locale, offer.short_description_ar, offer.short_description_en),
  };
}

export function OfferPosterCard({ offer }: { offer: Product }) {
  const { t, locale } = useI18n();
  const { title } = offerText(offer, locale);
  const { pending, startOrder } = useStartOffer(offer);
  const price = Number(offer.price);
  const before = offer.old_price != null ? Number(offer.old_price) : null;

  return (
    <View style={styles.poster}>
      <View style={styles.posterFrame}>
        {offer.image_url ? (
          <RemoteImage uri={offer.image_url} fit="contain" style={styles.fill} />
        ) : (
          <Text style={{ fontSize: 48 }}>🎁</Text>
        )}
      </View>
      <View style={styles.posterBody}>
        <View>
          <Txt style={styles.special}>{t("specialOffer")}</Txt>
          <Txt style={styles.posterTitle}>{title}</Txt>
        </View>
        <View style={styles.action}>
          <View>
            {before != null && before > price ? (
              <Txt style={styles.beforeLabel}>
                {t("priceBefore")} <Text style={styles.beforeValue}>{formatPrice(before, locale)}</Text>
              </Txt>
            ) : (
              <Txt style={styles.beforeLabel}>{t("bundlePrice")}</Txt>
            )}
            <Txt style={styles.posterPrice}>{formatPrice(price, locale)}</Txt>
          </View>
          <Pressable onPress={() => void startOrder()} disabled={pending} style={[styles.orderDark, pending && { opacity: 0.6 }]}>
            <Text style={styles.orderDarkText}>{t("orderShort")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function OfferCatalogCard({ offer, width }: { offer: Product; width: number }) {
  const { t, locale } = useI18n();
  const { title, description } = offerText(offer, locale);
  const { pending, startOrder } = useStartOffer(offer);
  const price = Number(offer.price);
  const before = offer.old_price != null ? Number(offer.old_price) : null;
  const percent = discountPercent(price, before);

  return (
    <View style={[styles.catalog, { width }]}>
      <View style={styles.catalogImage}>
        {percent ? (
          <View style={styles.discount}>
            <Text style={styles.discountText}>{t("discountOff", { percent })}</Text>
          </View>
        ) : null}
        <View style={styles.imagePad}>
          {offer.image_url ? (
            <RemoteImage uri={offer.image_url} fit="contain" style={styles.fill} />
          ) : (
            <Text style={{ fontSize: 36, textAlign: "center" }}>🎁</Text>
          )}
        </View>
      </View>
      <View style={styles.catalogBody}>
        <Txt numberOfLines={2} style={styles.catalogTitle}>
          {title}
        </Txt>
        {description ? (
          <Txt numberOfLines={2} style={styles.catalogBlurb}>
            {description}
          </Txt>
        ) : null}
        <View style={styles.catalogBottom}>
          <Txt style={styles.catalogPrice}>{formatPrice(price, locale)}</Txt>
          {before != null && before > price ? (
            <View style={styles.saveRow}>
              <Text style={styles.strike}>{formatPrice(before, locale)}</Text>
              <Text style={styles.save}>{t("saveAmount", { amount: formatPrice(before - price, locale) })}</Text>
            </View>
          ) : null}
          <Pressable onPress={() => void startOrder()} disabled={pending} style={[styles.orderGreen, pending && { opacity: 0.6 }]}>
            <Text style={styles.orderGreenText}>{t("orderShort")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function HomeOffers({ offers }: { offers: Product[] }) {
  const { t, isRTL } = useI18n();
  const [selected, setSelected] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const count = offers.length;

  const go = (next: number) => {
    if (count === 0) return;
    const target = Math.max(0, Math.min(count - 1, next));
    if (target === selected) return;
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setSelected(target);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => {
      setSelected((current) => (current + 1 < count ? current + 1 : current));
    }, 6500);
    return () => clearInterval(timer);
  }, [count]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          const forward = isRTL ? g.dx > 40 : g.dx < -40;
          const back = isRTL ? g.dx < -40 : g.dx > 40;
          if (forward) go(selected + 1);
          else if (back) go(selected - 1);
        },
      }),
    [isRTL, selected, count],
  );

  if (count === 0) return null;
  const offer = offers[Math.min(selected, count - 1)];
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <View style={styles.section}>
      <View style={{ gap: 16 }}>
        <View>
          <Eyebrow
            label={t("offerEyebrow")}
            icon={<Tag size={14} color={colors.offerGreen} />}
            style={{ backgroundColor: colors.offerPill }}
            textStyle={{ color: colors.offerGreen }}
          />
          <Txt style={styles.h2}>{t("offerTitle")}</Txt>
          <Txt style={styles.sub}>{t("offerSub")}</Txt>
        </View>
        <ArrowLink label={t("allOffers")} onPress={() => router.navigate("/offers")} color={colors.offerGreen} />
      </View>

      <View style={{ marginTop: 32 }} {...pan.panHandlers}>
        <Animated.View style={{ opacity: fade, paddingEnd: 16 }}>
          <OfferPosterCard key={offer.id} offer={offer} />
        </Animated.View>

        {count > 1 ? (
          <View style={styles.controls}>
            <Pressable onPress={() => go(selected - 1)} style={styles.navBtn} accessibilityLabel={t("offerPrev")}>
              <PrevIcon size={20} color={colors.offerInk} />
            </Pressable>
            <View style={styles.dots}>
              {offers.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => go(index)}
                  style={[styles.dot, index === selected ? styles.dotActive : null]}
                />
              ))}
            </View>
            <Pressable onPress={() => go(selected + 1)} style={styles.navBtn} accessibilityLabel={t("offerNext")}>
              <NextIcon size={20} color={colors.offerInk} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingVertical: 56, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#e7eee4" },
  h2: { marginTop: 12, color: colors.offerInk, fontFamily: fonts.display900, ...text["3xl"] },
  sub: { marginTop: 8, color: colors.offerBody, ...text.sm, lineHeight: 23 },
  poster: {
    overflow: "hidden",
    borderRadius: 25.6,
    borderWidth: 1,
    borderColor: "#e6eee4",
    backgroundColor: colors.white,
    boxShadow: "0px 10px 30px 0px rgba(23,50,34,0.06)",
  },
  posterFrame: { height: 208, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f6ef" },
  fill: { width: "100%", height: "100%" },
  posterBody: { gap: 12, padding: 16 },
  special: { color: colors.offerGreen, fontFamily: fonts.body800, fontSize: 11, lineHeight: 16 },
  posterTitle: { marginTop: 4, color: colors.offerInk, fontFamily: fonts.display900, fontSize: 18, lineHeight: 25 },
  action: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e6eee4",
    paddingTop: 16,
  },
  beforeLabel: { color: "#6b7f72", fontFamily: fonts.body700, fontSize: 11 },
  beforeValue: { color: "#8aa094", fontFamily: fonts.body700, fontSize: 14, textDecorationLine: "line-through" },
  posterPrice: { color: colors.offerInk, fontFamily: fonts.display900, ...text["2xl"] },
  orderDark: { borderRadius: 999, backgroundColor: colors.offerInk, paddingHorizontal: 16, paddingVertical: 10 },
  orderDarkText: { color: colors.white, fontFamily: fonts.body800, fontSize: 12 },
  controls: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 8px 24px 0px rgba(23,50,34,0.12)",
  },
  dots: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { height: 10, width: 10, borderRadius: 999, backgroundColor: "#c5d4c8" },
  dotActive: { width: 28, backgroundColor: colors.offerGreen },
  catalog: {
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.cardLine,
    backgroundColor: colors.white,
    boxShadow: shadows.product,
  },
  catalogImage: { width: "100%", aspectRatio: 1.14, backgroundColor: colors.white },
  imagePad: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, padding: 12, justifyContent: "center" },
  discount: {
    position: "absolute",
    top: 12,
    start: 12,
    zIndex: 10,
    borderRadius: 999,
    backgroundColor: colors.offerInk,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  discountText: { color: colors.white, fontFamily: fonts.body900, fontSize: 11, lineHeight: 15 },
  catalogBody: { flex: 1, gap: 6, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 8 },
  catalogTitle: { minHeight: 38.4, color: colors.title, fontFamily: fonts.display800, fontSize: 15, lineHeight: 20.6 },
  catalogBlurb: { color: colors.blurb, fontFamily: fonts.body500, fontSize: 12, lineHeight: 19.5 },
  catalogBottom: { marginTop: "auto", gap: 8, paddingTop: 8 },
  catalogPrice: { color: colors.priceGreen, fontFamily: fonts.body800, ...text.base },
  saveRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 2 },
  strike: { color: colors.mutedFg, fontFamily: fonts.body400, fontSize: 11, textDecorationLine: "line-through" },
  save: { color: colors.offerGreen, fontFamily: fonts.body700, fontSize: 11 },
  orderGreen: {
    height: 36,
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.addGreen,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.add,
  },
  orderGreenText: { color: colors.white, fontFamily: fonts.body800, fontSize: 12 },
});
