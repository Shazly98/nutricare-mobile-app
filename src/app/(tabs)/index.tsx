import { router } from "expo-router";
import {
  Atom,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Leaf,
  Newspaper,
  Pill as PillIcon,
  ShieldCheck,
  Smile,
  Stethoscope,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ProductCard } from "@/components/ProductCard";
import { SiteScreen } from "@/components/SiteScreen";
import { RemoteImage, Txt } from "@/components/ui";
import {
  usePublicArticles,
  usePublicBrands,
  usePublicCategories,
  usePublicOffers,
  usePublicProducts,
} from "@/lib/catalog";
import { useI18n } from "@/lib/locale";
import { articleTitle, categoryTitle } from "@/lib/localized";
import type { Article, Brand, Category, Product } from "@/lib/types";
import { discountPercent } from "@/lib/types";
import { colors, fonts, twoColWidth } from "@/theme";

const RAIL_CARD = 168;

export default function HomeScreen() {
  const products = usePublicProducts();
  const categories = usePublicCategories();
  const offers = usePublicOffers();
  const articles = usePublicArticles();
  const brands = usePublicBrands();
  const catalog = products.data ?? [];
  const cats = categories.data ?? [];
  const featured = catalog.filter((p) => p.is_featured);
  const showcase = (featured.length > 0 ? featured : catalog).slice(0, 8);
  const deals = catalog.filter((p) => discountPercent(Number(p.price), p.old_price) > 0).slice(0, 10);
  const offerCount = (offers.data ?? []).length;

  const refreshing = products.isRefetching || offers.isRefetching;
  const refresh = () => {
    void products.refetch();
    void categories.refetch();
    void offers.refetch();
    void articles.refetch();
    void brands.refetch();
  };

  return (
    <SiteScreen refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.page}>
        <PromoRail offerCount={offerCount} />
        <TrustStrip productCount={catalog.length} />
        {cats.length > 0 ? <Categories categories={cats} /> : null}
        {deals.length > 0 ? <ProductRail products={deals} onSeeAll={() => router.navigate("/offers")} /> : null}
        {showcase.length > 0 ? (
          <Featured products={showcase} usingFallback={featured.length === 0} />
        ) : null}
        {(brands.data ?? []).length > 0 ? <Brands brands={brands.data ?? []} /> : null}
        <IHerbBanner />
        {(articles.data ?? []).length > 0 ? <Bulletin articles={articles.data ?? []} /> : null}
      </View>
    </SiteScreen>
  );
}

function PromoRail({ offerCount }: { offerCount: number }) {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;
  const cards = [
    {
      key: "shop",
      title: t("shopProducts"),
      body: t("homeLeadEmpty"),
      colors: [colors.primary, "#1f6b22"] as const,
      onPress: () => router.navigate("/products"),
    },
    {
      key: "offers",
      title: t("allOffers"),
      body: offerCount > 0 ? t("offersSubCount", { count: offerCount }) : t("offerSub"),
      colors: ["#173222", "#245c38"] as const,
      onPress: () => router.navigate("/offers"),
    },
    {
      key: "iherb",
      title: t("navIherb"),
      body: t("iherbTitle"),
      colors: ["#10261a", "#1c4330"] as const,
      onPress: () => router.navigate("/iherb"),
    },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoRow}>
      {cards.map((card) => (
        <Pressable key={card.key} onPress={card.onPress} style={styles.promoCard}>
          <LinearGradient colors={card.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoFill}>
            <Text style={styles.promoTitle}>{card.title}</Text>
            <Text numberOfLines={2} style={styles.promoBody}>
              {card.body}
            </Text>
            <View style={styles.promoCta}>
              <Text style={styles.promoCtaText}>{t("shopRail")}</Text>
              <Arrow size={14} color={colors.ink} />
            </View>
          </LinearGradient>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function TrustStrip({ productCount }: { productCount: number }) {
  const { t } = useI18n();
  const items = [
    { icon: BadgeCheck, label: t("trust1t") },
    { icon: Truck, label: t("trust3t") },
    { icon: ShieldCheck, label: productCount > 0 ? t("trust4t", { count: productCount }) : t("catalogWide") },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trustRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.trustChip}>
          <item.icon size={14} color={colors.primary} />
          <Text style={styles.trustText}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function iconForCategory(name: string): LucideIcon {
  const n = name.trim();
  if (n.includes("فيتامين") || n.includes("vitamin")) return PillIcon;
  if (n.includes("معادن") || n.includes("معدن") || n.includes("mineral")) return Atom;
  if (n.includes("شعر") || n.includes("بشرة") || n.includes("hair") || n.includes("skin")) return Leaf;
  if (n.includes("مناعة") || n.includes("immune")) return ShieldCheck;
  if (n.includes("طاقة") || n.includes("تركيز") || n.includes("energy") || n.includes("focus")) return Zap;
  if (n.includes("أطفال") || n.includes("طفل") || n.includes("kid") || n.includes("child")) return Smile;
  if (n.includes("رياض") || n.includes("بروتين") || n.includes("sport") || n.includes("protein")) return Dumbbell;
  if (n.includes("هضم") || n.includes("هضمي") || n.includes("digest")) return Stethoscope;
  return Leaf;
}

function Categories({ categories }: { categories: Category[] }) {
  const { t, locale } = useI18n();
  return (
    <View style={styles.block}>
      <SectionHead title={t("catTitle")} action={t("allProducts")} onPress={() => router.navigate("/products")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {categories.map((c) => {
          const Icon = iconForCategory(`${c.name_ar} ${c.name_en ?? ""}`);
          const isImage = Boolean(c.icon && /^(https?:|\/)/i.test(c.icon));
          return (
            <Pressable
              key={c.id}
              onPress={() => router.navigate({ pathname: "/products", params: { category: c.id, q: "" } })}
              style={styles.catItem}
            >
              <View style={styles.catCircle}>
                {isImage ? (
                  <RemoteImage uri={c.icon} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Icon size={22} color={colors.primary} />
                )}
              </View>
              <Text numberOfLines={2} style={styles.catName}>
                {categoryTitle(c, locale)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ProductRail({ products, onSeeAll }: { products: Product[]; onSeeAll: () => void }) {
  const { t } = useI18n();
  return (
    <View style={styles.block}>
      <SectionHead title={t("dealsRail")} action={t("viewAll")} onPress={onSeeAll} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} width={RAIL_CARD} />
        ))}
      </ScrollView>
    </View>
  );
}

function Featured({ products, usingFallback }: { products: Product[]; usingFallback: boolean }) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const cell = twoColWidth(width);
  return (
    <View style={styles.block}>
      <SectionHead
        title={usingFallback ? t("featFallback") : t("featTitle")}
        action={t("viewAll")}
        onPress={() => router.navigate("/products")}
      />
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} width={cell} />
        ))}
      </View>
    </View>
  );
}

function Brands({ brands }: { brands: Brand[] }) {
  const { t } = useI18n();
  return (
    <View style={styles.block}>
      <SectionHead title={t("brandTitle")} action={t("allProducts")} onPress={() => router.navigate("/products")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
        {brands.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => router.navigate({ pathname: "/products", params: { q: b.name, category: "" } })}
            style={styles.brandTile}
          >
            {b.logo_url ? (
              <RemoteImage uri={b.logo_url} fit="contain" style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text numberOfLines={2} style={styles.brandName}>
                {b.name}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function IHerbBanner() {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable onPress={() => router.navigate("/iherb")} style={styles.iherb}>
      <View style={{ flex: 1 }}>
        <Text style={styles.iherbKicker}>iHerb</Text>
        <Text style={styles.iherbTitle}>{t("iherbTitle")}</Text>
      </View>
      <View style={styles.iherbBtn}>
        <Arrow size={18} color={colors.ink} />
      </View>
    </Pressable>
  );
}

function Bulletin({ articles }: { articles: Article[] }) {
  const { t, locale } = useI18n();
  return (
    <View style={styles.block}>
      <SectionHead title={t("bulletinTitle")} action={t("allBulletins")} onPress={() => router.navigate("/bulletin")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {articles.slice(0, 6).map((article) => (
          <Pressable
            key={article.id}
            onPress={() => router.navigate({ pathname: "/article/[slug]", params: { slug: article.slug } })}
            style={styles.article}
          >
            <View style={styles.articleCover}>
              {article.cover_url ? (
                <RemoteImage uri={article.cover_url} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Newspaper size={22} color={colors.primary} />
              )}
            </View>
            <Txt numberOfLines={2} style={styles.articleTitle}>
              {articleTitle(article, locale)}
            </Txt>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function SectionHead({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  const { isRTL } = useI18n();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;
  return (
    <View style={styles.head}>
      <Text style={styles.headTitle}>{title}</Text>
      <Pressable onPress={onPress} style={styles.headAction} accessibilityLabel={action}>
        <Text style={styles.headActionText}>{action}</Text>
        <Arrow size={14} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 14, paddingBottom: 8, gap: 22 },
  promoRow: { paddingHorizontal: 16, gap: 12 },
  promoCard: { width: 260, height: 148, borderRadius: 18, overflow: "hidden" },
  promoFill: { flex: 1, padding: 16, justifyContent: "space-between" },
  promoTitle: { color: colors.white, fontFamily: fonts.display800, fontSize: 20, lineHeight: 28 },
  promoBody: { color: "rgba(255,255,255,0.82)", fontFamily: fonts.body500, fontSize: 13, lineHeight: 19 },
  promoCta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  promoCtaText: { color: colors.ink, fontFamily: fonts.body800, fontSize: 12 },
  trustRow: { paddingHorizontal: 16, gap: 8 },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trustText: { color: colors.ink, fontFamily: fonts.body700, fontSize: 12 },
  block: { gap: 12 },
  head: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  headTitle: { flex: 1, color: colors.ink, fontFamily: fonts.display800, fontSize: 18, lineHeight: 26 },
  headAction: { flexDirection: "row", alignItems: "center", gap: 2 },
  headActionText: { color: colors.primary, fontFamily: fonts.body800, fontSize: 13 },
  catRow: { paddingHorizontal: 16, gap: 14 },
  catItem: { width: 72, alignItems: "center", gap: 8 },
  catCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { color: colors.ink, fontFamily: fonts.body700, fontSize: 11, lineHeight: 15, textAlign: "center" },
  rail: { paddingHorizontal: 16, gap: 10 },
  grid: { paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  brandRow: { paddingHorizontal: 16, gap: 10 },
  brandTile: {
    width: 88,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  brandName: { color: colors.ink, fontFamily: fonts.body800, fontSize: 11, textAlign: "center" },
  iherb: {
    marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.iherbBg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iherbKicker: { color: colors.lime, fontFamily: fonts.body800, fontSize: 12 },
  iherbTitle: { marginTop: 4, color: colors.white, fontFamily: fonts.display800, fontSize: 16, lineHeight: 24 },
  iherbBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.lime, alignItems: "center", justifyContent: "center" },
  article: { width: 200, borderRadius: 16, backgroundColor: colors.white, overflow: "hidden" },
  articleCover: { height: 110, backgroundColor: "#e8f3e4", alignItems: "center", justifyContent: "center" },
  articleTitle: { padding: 12, fontFamily: fonts.body800, fontSize: 13, lineHeight: 19, color: colors.ink },
});
