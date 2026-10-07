import { useLocalSearchParams } from "expo-router";
import {
  Atom,
  ChevronDown,
  Dumbbell,
  Grid2x2,
  LayoutGrid,
  LayoutList,
  Leaf,
  Pill as PillIcon,
  Search,
  ShieldCheck,
  Smile,
  Stethoscope,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { CatalogHero } from "@/components/CatalogHero";
import { ProductCard } from "@/components/ProductCard";
import { SiteScreen } from "@/components/SiteScreen";
import { ErrorBlock, Txt } from "@/components/ui";
import { useInfinitePublicProducts, usePublicCategories } from "@/lib/catalog";
import { useI18n } from "@/lib/locale";
import { categoryTitle } from "@/lib/localized";
import { colors, fonts, twoColWidth } from "@/theme";

const HERO_AR = require("../../../assets/images/catalog-hero-bg-mobile.jpg");
const HERO_EN = require("../../../assets/images/catalog-hero-bg-EN.png");

function iconForCategory(name: string): LucideIcon {
  const n = name.trim();
  if (!n) return LayoutGrid;
  if (n.includes("فيتامين") || n.includes("vitamin")) return PillIcon;
  if (n.includes("معادن") || n.includes("معدن") || n.includes("mineral")) return Atom;
  if (n.includes("شعر") || n.includes("بشرة") || n.includes("hair") || n.includes("skin")) return Leaf;
  if (n.includes("مناعة") || n.includes("immune")) return ShieldCheck;
  if (n.includes("طاقة") || n.includes("تركيز") || n.includes("energy") || n.includes("focus")) return Zap;
  if (n.includes("أطفال") || n.includes("طفل") || n.includes("kid") || n.includes("child")) return Smile;
  if (n.includes("رياض") || n.includes("بروتين") || n.includes("sport") || n.includes("protein")) return Dumbbell;
  if (n.includes("هضم") || n.includes("هضمي") || n.includes("digest")) return Stethoscope;
  return LayoutGrid;
}

type Sort = "popular" | "newest" | "price-low" | "price-high";

export default function ProductsScreen() {
  const { t, locale, isRTL } = useI18n();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const { width } = useWindowDimensions();
  const categories = usePublicCategories();
  const [query, setQuery] = useState(params.q ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(params.q ?? "");
  const [cat, setCat] = useState(params.category || "all");
  const [sort, setSort] = useState<Sort>("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const sortOptions: { value: Sort; label: string }[] = [
    { value: "popular", label: t("sortPopular") },
    { value: "newest", label: t("sortNewest") },
    { value: "price-low", label: t("sortLow") },
    { value: "price-high", label: t("sortHigh") },
  ];
  const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? sortOptions[0].label;

  useEffect(() => {
    setQuery(params.q ?? "");
    setDebouncedQuery(params.q ?? "");
  }, [params.q]);

  useEffect(() => {
    setCat(params.category || "all");
  }, [params.category]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const products = useInfinitePublicProducts({ category: cat, q: debouncedQuery });
  const items = useMemo(() => products.data?.pages.flatMap((page) => page.items) ?? [], [products.data]);
  const sortedItems = useMemo(() => {
    const next = [...items];
    if (sort === "price-low") return next.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-high") return next.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "newest") return next.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
    return next.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }, [items, sort]);
  const totalCount = products.data?.pages[0]?.count ?? 0;
  const cats = categories.data ?? [];
  const cell = twoColWidth(width);

  const loadMore = () => {
    if (products.hasNextPage && !products.isFetchingNextPage) void products.fetchNextPage();
  };

  return (
    <SiteScreen
      background={colors.catalogBg}
      initialQuery={params.q ?? ""}
      onEndReached={loadMore}
      refreshing={products.isRefetching && !products.isFetchingNextPage}
      onRefresh={() => void products.refetch()}
    >
      <CatalogHero
        image={locale === "en" ? HERO_EN : HERO_AR}
        position={locale === "en" ? { right: 0, top: "50%" } : { left: "50%", top: "70%" }}
        overlay="vertical"
        crumb={t("navProducts")}
        pill={t("fullCatalog")}
        title={t("allProducts")}
        subtitle={t("catalogSub", { count: totalCount > 0 ? totalCount : "…" })}
      />

      <View style={styles.body}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip active={cat === "all"} onPress={() => setCat("all")} icon={<Grid2x2 size={14} color={cat === "all" ? colors.white : "#34464a"} />}>
            {t("all")}
          </Chip>
          {cats.map((c) => {
            const Icon = iconForCategory(`${c.name_ar} ${c.name_en ?? ""}`);
            const active = cat === c.id;
            return (
              <Chip
                key={c.id}
                active={active}
                onPress={() => setCat(c.id)}
                icon={<Icon size={14} strokeWidth={1.8} color={active ? colors.white : "#34464a"} />}
              >
                {categoryTitle(c, locale)}
              </Chip>
            );
          })}
        </ScrollView>

        <View style={styles.toolbar}>
          <Txt style={styles.count}>
            {t("showing")} <Text style={styles.countNum}>{items.length}</Text> {t("of")}{" "}
            <Text style={styles.countNum}>{totalCount}</Text> <Text style={styles.countWord}>{t("productWord")}</Text>
          </Txt>

          <View style={styles.searchBox}>
            <Search size={18} color="#8a918b" strokeWidth={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("searchProduct")}
              placeholderTextColor="#b0b5ae"
              returnKeyType="search"
              style={[
                styles.searchInput,
                Platform.OS === "web" ? { textAlign: isRTL ? "right" : "left" } : null,
                { writingDirection: isRTL ? "rtl" : "ltr" },
              ]}
            />
          </View>

          <View style={styles.controls}>
            <View style={{ zIndex: 30 }}>
              <Pressable onPress={() => setSortOpen((o) => !o)} style={styles.sortBtn} accessibilityLabel={t("sortAria")}>
                <Text style={styles.sortText}>{sortLabel}</Text>
                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  color="#5f6b66"
                  style={sortOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
                />
              </Pressable>
              {sortOpen ? (
                <View style={styles.sortMenu}>
                  {sortOptions.map((option) => {
                    const active = option.value === sort;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          setSort(option.value);
                          setSortOpen(false);
                        }}
                        style={[styles.sortItem, active && { backgroundColor: "#1f8a3a" }]}
                      >
                        <Txt style={[styles.sortItemText, active && { color: colors.white }]}>{option.label}</Txt>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View style={styles.views}>
              <ViewToggle active={view === "grid"} onPress={() => setView("grid")} label={t("gridView")} Icon={LayoutGrid} />
              <ViewToggle active={view === "list"} onPress={() => setView("list")} label={t("listView")} Icon={LayoutList} />
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {products.isLoading ? (
            <View style={styles.placeholder}>
              <Txt style={styles.placeholderText}>{t("loadingProducts")}</Txt>
            </View>
          ) : products.isError && items.length === 0 ? (
            <View style={{ width: "100%" }}>
              <ErrorBlock onRetry={() => void products.refetch()} />
            </View>
          ) : (
            sortedItems.map((product) => (
              <ProductCard key={product.id} product={product} width={view === "grid" ? cell : undefined} listView={view === "list"} />
            ))
          )}
          {!products.isLoading && !products.isError && items.length === 0 ? (
            <View style={[styles.placeholder, { paddingVertical: 56, paddingHorizontal: 24 }]}>
              <Search size={32} color="#858c83" />
              <Txt style={styles.noMatch}>{t("noMatch")}</Txt>
              <Pressable
                onPress={() => {
                  setQuery("");
                  setCat("all");
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetText}>{t("viewAll")}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={{ height: 24 }} />
        {products.isFetchingNextPage ? <Txt style={styles.status}>{t("loadingMore")}</Txt> : null}
        {!products.isLoading && !products.hasNextPage && items.length > 0 ? (
          <Txt style={styles.status}>{t("endOfProducts")}</Txt>
        ) : null}
      </View>
    </SiteScreen>
  );
}

function Chip({ active, onPress, icon, children }: { active: boolean; onPress: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      {icon}
      <Text style={[styles.chipText, { color: active ? colors.white : "#34464a" }]}>{children}</Text>
    </Pressable>
  );
}

function ViewToggle({ active, onPress, label, Icon }: { active: boolean; onPress: () => void; label: string; Icon: LucideIcon }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.toggle, active ? { borderColor: "#1f8a3a", backgroundColor: "#1f8a3a" } : { borderColor: "#e5e9e2", backgroundColor: colors.white }]}
    >
      <Icon size={18} strokeWidth={2} color={active ? colors.white : "#5f6b66"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, paddingVertical: 24 },
  chips: { gap: 8, paddingBottom: 4 },
  chip: { height: 32, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12 },
  chipActive: { borderColor: colors.addGreen, backgroundColor: colors.addGreen, boxShadow: "0px 4px 12px 0px rgba(36,134,56,0.16)" },
  chipIdle: { borderColor: "#e3e8df", backgroundColor: colors.white, boxShadow: "0px 3px 10px 0px rgba(32,63,37,0.03)" },
  chipText: { fontFamily: fonts.body700, fontSize: 11 },
  toolbar: { marginTop: 20, gap: 12, borderTopWidth: 1, borderTopColor: "#eef2ec", paddingTop: 16, zIndex: 30 },
  count: { color: "#2b3532", fontFamily: fonts.body700, fontSize: 15, lineHeight: 22 },
  countNum: { color: "#1f8a3a", fontFamily: fonts.body800, fontSize: 16 },
  countWord: { color: "#1f8a3a", fontFamily: fonts.body800 },
  searchBox: {
    height: 44,
    width: "100%",
    maxWidth: 448,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e9e2",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    boxShadow: "0px 2px 10px 0px rgba(32,63,37,0.03)",
  },
  searchInput: { flex: 1, height: "100%", fontFamily: fonts.body700, fontSize: 14, color: "#263c35" },
  controls: { flexDirection: "row", alignItems: "center", gap: 10, zIndex: 30 },
  sortBtn: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e9e2",
    backgroundColor: colors.white,
    paddingStart: 12,
    paddingEnd: 14,
  },
  sortText: { color: "#3a4743", fontFamily: fonts.body700, fontSize: 13 },
  sortMenu: {
    position: "absolute",
    top: 48,
    start: 0,
    minWidth: "100%",
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e9e2",
    backgroundColor: colors.white,
    paddingVertical: 6,
    boxShadow: "0px 12px 32px 0px rgba(26,52,32,0.12)",
    zIndex: 30,
    elevation: 8,
  },
  sortItem: { paddingHorizontal: 16, paddingVertical: 10 },
  sortItemText: { color: "#3a4743", fontFamily: fonts.body700, fontSize: 13 },
  views: { flexDirection: "row", gap: 6 },
  toggle: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  grid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  placeholder: {
    width: "100%",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#dbe3d7",
    backgroundColor: colors.white,
    paddingVertical: 48,
  },
  placeholderText: { color: "#778078", fontFamily: fonts.body700, fontSize: 16, textAlign: "center" },
  noMatch: { marginTop: 12, color: "#173b2e", fontFamily: fonts.body800, fontSize: 16, textAlign: "center" },
  resetBtn: { marginTop: 16, borderRadius: 999, backgroundColor: colors.addGreen, paddingHorizontal: 20, paddingVertical: 10 },
  resetText: { color: colors.white, fontFamily: fonts.body800, fontSize: 12 },
  status: { marginTop: 8, color: "#858c83", fontFamily: fonts.body700, fontSize: 13, textAlign: "center" },
});
