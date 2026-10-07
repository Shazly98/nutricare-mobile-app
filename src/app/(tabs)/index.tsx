import { Image } from "expo-image";
import { router } from "expo-router";
import {
  BadgeCheck,
  ClipboardList,
  Newspaper,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Truck,
  type LucideIcon,
} from "lucide-react-native";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { IHerbSection } from "@/components/IHerbSection";
import { HomeOffers } from "@/components/OfferCards";
import { ProductCard } from "@/components/ProductCard";
import { SiteScreen } from "@/components/SiteScreen";
import { ArrowLink, BrandLogo, Eyebrow, Gradient, Pill, RemoteImage, SectionHeading, Txt } from "@/components/ui";
import {
  usePublicArticles,
  usePublicBrands,
  usePublicCategories,
  usePublicOffers,
  usePublicProducts,
} from "@/lib/catalog";
import { formatArticleDate } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { articleCardExcerpt, articleTitle, categoryTitle } from "@/lib/localized";
import type { Article, Brand, Category, Product } from "@/lib/types";
import { colors, fonts, shadows, text, twoColWidth } from "@/theme";

const HERO = require("../../../assets/images/hero-lifestyle.jpg");

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
  const productCount = catalog.length;

  const sections: { key: string; node: ReactElement | null; dark?: boolean }[] = [
    { key: "hero", node: <Hero productCount={productCount} /> },
    { key: "trust", node: <TrustBar productCount={productCount} /> },
    { key: "categories", node: cats.length > 0 ? <Categories categories={cats} products={catalog} /> : null },
    { key: "featured", node: showcase.length > 0 ? <Featured products={showcase} usingFallback={featured.length === 0} /> : null },
    { key: "offers", node: (offers.data ?? []).length > 0 ? <HomeOffers offers={offers.data ?? []} /> : null },
    { key: "iherb", node: <IHerbSection />, dark: true },
    { key: "brands", node: (brands.data ?? []).length > 0 ? <Brands brands={brands.data ?? []} /> : null },
    { key: "bulletin", node: (articles.data ?? []).length > 0 ? <Bulletin articles={articles.data ?? []} /> : null },
    { key: "how", node: <HowItWorks /> },
    { key: "about", node: <About /> },
    { key: "cta", node: <HomeCta /> },
  ];
  const visible = sections.filter((section) => section.node !== null);

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
      {visible.map((section, index) => (
        <View
          key={section.key}
          style={{ backgroundColor: section.dark ? colors.iherbBg : index % 2 === 0 ? "#ffffff" : colors.sectionAlt }}
        >
          {section.node}
        </View>
      ))}
    </SiteScreen>
  );
}

function Hero({ productCount }: { productCount: number }) {
  const { t } = useI18n();
  return (
    <View>
      <Image source={HERO} style={{ width: "100%", aspectRatio: 1942 / 809 }} contentFit="cover" accessibilityLabel={t("heroAlt")} />
      <View style={styles.heroBody}>
        <View>
          <Txt style={styles.kicker}>{t("homeKicker")}</Txt>
          <Txt style={styles.h1}>{t("homeTitle")}</Txt>
          <Txt style={styles.lead}>
            {productCount > 0 ? t("homeLeadCount", { count: productCount }) : t("homeLeadEmpty")} {t("homeLeadBrands")}
          </Txt>
        </View>
        <View style={styles.heroActions}>
          <Pill
            label={t("shopProducts")}
            icon={<ShoppingBag size={16} color={colors.primaryFg} />}
            onPress={() => router.navigate("/products")}
          />
          <Pill
            label={t("navContact")}
            variant="outline"
            onPress={() => router.navigate("/contact")}
            style={{ borderColor: colors.searchLine, backgroundColor: colors.white }}
          />
        </View>
      </View>
    </View>
  );
}

function TrustBar({ productCount }: { productCount: number }) {
  const { t } = useI18n();
  const items: { icon: LucideIcon; title: string; d: string }[] = [
    { icon: BadgeCheck, title: t("trust1t"), d: t("trust1d") },
    { icon: Stethoscope, title: t("trust2t"), d: t("trust2d") },
    { icon: Truck, title: t("trust3t"), d: t("trust3d") },
    { icon: Sparkles, title: productCount > 0 ? t("trust4t", { count: productCount }) : t("catalogWide"), d: t("trust4d") },
  ];

  return (
    <View style={styles.trust}>
      {items.map((item, index) => (
        <View
          key={item.d}
          style={[styles.trustItem, index > 0 && styles.trustDivider]}
        >
          <View style={styles.trustIcon}>
            <item.icon size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.trustTitle}>{item.title}</Txt>
            <Txt style={styles.trustText}>{item.d}</Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

function Categories({ categories, products }: { categories: Category[]; products: Product[] }) {
  const { t, locale } = useI18n();
  const { width } = useWindowDimensions();
  const cell = twoColWidth(width);

  return (
    <View style={[styles.section, styles.borderY]}>
      <View style={{ gap: 16 }}>
        <SectionHeading align="start" eyebrow={t("catEyebrow")} title={t("catTitle")} subtitle={t("catSub")} />
        <ArrowLink label={t("allProducts")} onPress={() => router.navigate("/products")} />
      </View>
      <View style={styles.grid}>
        {categories.map((c) => {
          const count = products.filter((p) => p.category_id === c.id).length;
          const isImage = Boolean(c.icon && /^(https?:|\/)/i.test(c.icon));
          return (
            <Pressable
              key={c.id}
              onPress={() => router.navigate({ pathname: "/products", params: { category: c.id, q: "" } })}
              style={[styles.catCard, { width: cell }]}
            >
              <View style={styles.catIcon}>
                {isImage ? (
                  <RemoteImage uri={c.icon} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Text style={{ fontSize: 20 }}>{c.icon || "🌿"}</Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt numberOfLines={1} style={styles.catName}>
                  {categoryTitle(c, locale)}
                </Txt>
                <Txt style={styles.catCount}>{count > 0 ? t("productCount", { count }) : t("browseCategory")}</Txt>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Featured({ products, usingFallback }: { products: Product[]; usingFallback: boolean }) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const cell = twoColWidth(width);
  return (
    <View style={styles.section}>
      <View style={{ gap: 16 }}>
        <SectionHeading
          align="start"
          eyebrow={t("featEyebrow")}
          title={usingFallback ? t("featFallback") : t("featTitle")}
          subtitle={t("featSub")}
        />
        <ArrowLink label={t("viewAll")} onPress={() => router.navigate("/products")} />
      </View>
      <View style={styles.grid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} width={cell} />
        ))}
      </View>
    </View>
  );
}

function Brands({ brands }: { brands: Brand[] }) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const cell = Math.floor((width - 32 - 24) / 3);
  return (
    <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border60 }]}>
      <SectionHeading eyebrow={t("brandEyebrow")} title={t("brandTitle")} subtitle={t("brandSub")} />
      <View style={[styles.grid, { marginTop: 40 }]}>
        {brands.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => router.navigate({ pathname: "/products", params: { q: b.name, category: "" } })}
            style={[styles.brandTile, { width: cell, height: cell }]}
          >
            {b.logo_url ? (
              <RemoteImage uri={b.logo_url} fit="contain" style={{ width: "100%", height: "100%", borderRadius: 16 }} />
            ) : (
              <Text style={styles.brandName}>{b.name}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Bulletin({ articles }: { articles: Article[] }) {
  const { t, locale } = useI18n();
  const items = articles.slice(0, 3);
  return (
    <View style={[styles.section, { paddingVertical: 64 }]}>
      <View style={{ gap: 16 }}>
        <View>
          <Eyebrow label={t("bulletinEyebrow")} icon={<Newspaper size={14} color={colors.primary} />} />
          <Txt style={[styles.h2, { marginTop: 12 }]}>{t("bulletinTitle")}</Txt>
          <Txt style={[styles.subText, { marginTop: 8 }]}>{t("bulletinHomeSub")}</Txt>
        </View>
        <ArrowLink label={t("allBulletins")} onPress={() => router.navigate("/bulletin")} />
      </View>
      <View style={{ marginTop: 40, gap: 16 }}>
        {items.map((article) => {
          const excerpt = articleCardExcerpt(article, locale);
          const date = formatArticleDate(article.published_at || article.created_at, locale);
          return (
            <Pressable
              key={article.id}
              onPress={() => router.navigate({ pathname: "/article/[slug]", params: { slug: article.slug } })}
              style={styles.articleCard}
            >
              <View style={styles.articleCover}>
                {article.cover_url ? (
                  <RemoteImage uri={article.cover_url} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Newspaper size={32} color={colors.primary} />
                )}
              </View>
              <View style={{ padding: 20 }}>
                {date ? <Txt style={styles.date}>{date}</Txt> : null}
                <Txt style={styles.articleTitle}>{articleTitle(article, locale)}</Txt>
                {excerpt ? (
                  <Txt numberOfLines={2} style={[styles.subText, { marginTop: 8 }]}>
                    {excerpt}
                  </Txt>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: "01", title: t("step1t"), d: t("step1d") },
    { n: "02", title: t("step2t"), d: t("step2d") },
    { n: "03", title: t("step3t"), d: t("step3d") },
  ];
  return (
    <View style={styles.section}>
      <SectionHeading eyebrow={t("stepEyebrow")} title={t("stepTitle")} subtitle={t("stepSub")} />
      <View style={{ marginTop: 40, gap: 16 }}>
        {steps.map((step) => (
          <View key={step.n} style={styles.stepCard}>
            <Txt style={styles.stepNum}>{step.n}</Txt>
            <Txt style={styles.stepTitle}>{step.title}</Txt>
            <Txt style={[styles.subText, { marginTop: 8 }]}>{step.d}</Txt>
          </View>
        ))}
      </View>
    </View>
  );
}

function About() {
  const { t } = useI18n();
  const features: { icon: LucideIcon; title: string }[] = [
    { icon: BadgeCheck, title: t("about1") },
    { icon: Truck, title: t("about2") },
    { icon: ClipboardList, title: t("about3") },
  ];
  return (
    <View style={[styles.section, { paddingVertical: 64, gap: 40 }]}>
      <View>
        <SectionHeading eyebrow={t("aboutEyebrow")} title={t("aboutTitle")} align="start" />
        <Txt style={styles.aboutBody}>
          <Text style={{ color: colors.primary, fontFamily: fonts.body700 }}>NutriCare</Text> {t("aboutBody")}
        </Txt>
        <View style={{ marginTop: 24, gap: 12 }}>
          {features.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <f.icon size={16} color={colors.primary} />
              </View>
              <Txt style={styles.featureText}>{f.title}</Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.aboutCard}>
        <BrandLogo size={132} />
        <Txt style={styles.aboutTag}>Nourishing Life, Naturally</Txt>
        <Txt style={[styles.subText, { marginTop: 8, textAlign: "center" }]}>{t("aboutTag")}</Txt>
      </View>
    </View>
  );
}

function HomeCta() {
  const { t } = useI18n();
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 64 }}>
      <Gradient style={styles.cta}>
        <View>
          <Txt style={[styles.h2, { color: colors.primaryFg }]}>{t("ctaTitle")}</Txt>
          <Txt style={[styles.subText, { marginTop: 8, color: "rgba(252,252,252,0.85)" }]}>{t("ctaBody")}</Txt>
        </View>
        <View style={styles.ctaActions}>
          <Pill
            label={t("productsPage")}
            variant="white"
            onPress={() => router.navigate("/products")}
            style={{ paddingHorizontal: 20 }}
          />
          <Pill
            label={t("contactPage")}
            variant="ghostWhite"
            onPress={() => router.navigate("/contact")}
            style={{ paddingHorizontal: 20 }}
          />
        </View>
      </Gradient>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBody: { borderTopWidth: 1, borderTopColor: colors.searchLine, paddingHorizontal: 16, paddingVertical: 28, gap: 24 },
  kicker: { color: colors.primary, fontFamily: fonts.body800, ...text.xs, letterSpacing: 0.3 },
  h1: { marginTop: 8, fontFamily: fonts.display900, fontSize: 30, lineHeight: 40 },
  lead: { marginTop: 12, color: colors.mutedFg, ...text.sm, lineHeight: 23 },
  heroActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 },
  trust: { flexDirection: "row", flexWrap: "wrap", borderBottomWidth: 1, borderBottomColor: colors.headerLine },
  trustItem: { width: "50%", flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 20, paddingVertical: 20 },
  trustDivider: {
    borderStartWidth: 1,
    borderStartColor: colors.headerLine,
    borderTopWidth: 1,
    borderTopColor: colors.headerLine,
  },
  trustIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.card,
  },
  trustTitle: { fontFamily: fonts.body800, ...text.sm },
  trustText: { marginTop: 2, color: colors.mutedFg, ...text.xs },
  section: { paddingHorizontal: 16, paddingVertical: 56 },
  borderY: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border60 },
  grid: { marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.searchBg,
    padding: 16,
  },
  catIcon: {
    width: 48,
    height: 48,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.card,
  },
  catName: { fontFamily: fonts.body800, ...text.sm },
  catCount: { color: colors.mutedFg, fontFamily: fonts.body700, fontSize: 11, lineHeight: 16 },
  brandTile: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.card,
  },
  brandName: { fontFamily: fonts.body800, ...text.xs, textAlign: "center", color: colors.foreground },
  h2: { fontFamily: fonts.display900, ...text["3xl"] },
  subText: { color: colors.mutedFg, ...text.sm, lineHeight: 23 },
  articleCard: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    boxShadow: shadows.card,
  },
  articleCover: { aspectRatio: 16 / 10, backgroundColor: "#e8f3e4", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  date: { color: colors.mutedFg, fontFamily: fonts.body700, fontSize: 11, lineHeight: 16 },
  articleTitle: { marginTop: 8, fontFamily: fonts.display900, ...text.lg, lineHeight: 25 },
  stepCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 24,
    boxShadow: shadows.card,
  },
  stepNum: { color: colors.primary25, fontFamily: fonts.display900, ...text["3xl"] },
  stepTitle: { marginTop: 16, fontFamily: fonts.display800, ...text.lg },
  aboutBody: { marginTop: 24, color: "rgba(16,31,19,0.85)", ...text.base, lineHeight: 32 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary10, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1, fontFamily: fonts.body800, ...text.sm },
  aboutCard: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.searchBg,
    padding: 32,
    boxShadow: shadows.card,
  },
  aboutTag: { marginTop: 20, color: colors.primary, fontFamily: fonts.display900, ...text.xl, textAlign: "center" },
  cta: { overflow: "hidden", borderRadius: 24, paddingHorizontal: 24, paddingVertical: 40, gap: 24, boxShadow: shadows.soft },
  ctaActions: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});
