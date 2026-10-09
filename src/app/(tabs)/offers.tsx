import { router } from "expo-router";
import { Tag } from "lucide-react-native";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { OfferCatalogCard } from "@/components/OfferCards";
import { SiteScreen } from "@/components/SiteScreen";
import { ErrorBlock, Txt } from "@/components/ui";
import { usePublicOffers } from "@/lib/catalog";
import { useI18n } from "@/lib/locale";
import { discountPercent } from "@/lib/types";
import { colors, fonts, twoColWidth } from "@/theme";

export default function OffersScreen() {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const offersQuery = usePublicOffers();
  const offers = [...(offersQuery.data ?? [])].sort(
    (a, b) => discountPercent(Number(b.price), b.old_price) - discountPercent(Number(a.price), a.old_price),
  );
  const cell = twoColWidth(width);

  return (
    <SiteScreen refreshing={offersQuery.isRefetching} onRefresh={() => void offersQuery.refetch()}>
      <View style={styles.banner}>
        <Text style={styles.bannerKicker}>{t("offerEyebrow")}</Text>
        <Text style={styles.bannerTitle}>{t("allOffers")}</Text>
        <Text style={styles.bannerSub}>
          {offers.length > 0 ? t("offersSubCount", { count: offers.length }) : t("offersSubEmpty")}
        </Text>
      </View>

      <View style={styles.body}>
        {offersQuery.isLoading ? (
          <View style={styles.placeholder}>
            <Txt style={styles.placeholderText}>{t("loadingOffers")}</Txt>
          </View>
        ) : offersQuery.isError ? (
          <ErrorBlock onRetry={() => void offersQuery.refetch()} />
        ) : offers.length === 0 ? (
          <View style={[styles.placeholder, { paddingVertical: 56, paddingHorizontal: 24 }]}>
            <Tag size={32} color="#858c83" />
            <Txt style={styles.emptyTitle}>{t("noOffers")}</Txt>
            <Txt style={styles.emptyHint}>{t("noOffersHint")}</Txt>
            <Pressable onPress={() => router.navigate("/products")} style={styles.browse}>
              <Text style={styles.browseText}>{t("browse")}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {offers.map((offer) => (
              <OfferCatalogCard key={offer.id} offer={offer} width={cell} />
            ))}
          </View>
        )}
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  banner: { margin: 16, marginBottom: 4, borderRadius: 18, backgroundColor: colors.offerInk, padding: 18 },
  bannerKicker: { color: colors.lime, fontFamily: fonts.body800, fontSize: 12 },
  bannerTitle: { marginTop: 6, color: colors.white, fontFamily: fonts.display800, fontSize: 24, lineHeight: 32 },
  bannerSub: { marginTop: 6, color: "rgba(255,255,255,0.78)", fontFamily: fonts.body500, fontSize: 13, lineHeight: 20 },
  body: { paddingHorizontal: 16, paddingVertical: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  placeholder: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#dbe3d7",
    backgroundColor: colors.white,
    paddingVertical: 48,
  },
  placeholderText: { color: "#778078", fontFamily: fonts.body700, fontSize: 16, textAlign: "center" },
  emptyTitle: { marginTop: 16, color: "#1A2421", fontFamily: fonts.body800, fontSize: 16, textAlign: "center" },
  emptyHint: { marginTop: 8, color: "#6F7A74", fontSize: 14, textAlign: "center" },
  browse: { marginTop: 24, borderRadius: 999, backgroundColor: colors.addGreen, paddingHorizontal: 20, paddingVertical: 10 },
  browseText: { color: colors.white, fontFamily: fonts.body800, fontSize: 14 },
});
