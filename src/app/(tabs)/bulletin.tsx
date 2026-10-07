import { router } from "expo-router";
import { Newspaper } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { SiteScreen } from "@/components/SiteScreen";
import { Breadcrumb, DashedBox, Gradient, RemoteImage, SectionHeading, Txt } from "@/components/ui";
import { usePublicArticles } from "@/lib/catalog";
import { formatArticleDate } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { articleCardExcerpt, articleTitle } from "@/lib/localized";
import type { Article } from "@/lib/types";
import { colors, fonts, shadows, text } from "@/theme";

export default function BulletinScreen() {
  const { t } = useI18n();
  const articlesQuery = usePublicArticles();
  const articles = articlesQuery.data ?? [];

  return (
    <SiteScreen refreshing={articlesQuery.isRefetching} onRefresh={() => void articlesQuery.refetch()}>
      <Gradient soft style={styles.head}>
        <Breadcrumb items={[{ label: t("navHome"), href: "/" }, { label: t("navBulletin") }]} />
        <View style={{ marginTop: 16 }}>
          <SectionHeading
            align="start"
            eyebrow={t("bulletinEyebrow")}
            title={t("bulletinTitle")}
            subtitle={articles.length > 0 ? t("bulletinSubCount", { count: articles.length }) : t("bulletinSubEmpty")}
          />
        </View>
      </Gradient>

      <View style={styles.body}>
        {articlesQuery.isLoading ? (
          <DashedBox>
            <Txt style={styles.muted}>{t("loadingBulletin")}</Txt>
          </DashedBox>
        ) : articlesQuery.isError ? (
          <DashedBox>
            <Newspaper size={32} color={colors.primary} />
            <Txt style={styles.emptyTitle}>{t("bulletinLoadError")}</Txt>
          </DashedBox>
        ) : articles.length === 0 ? (
          <DashedBox>
            <Newspaper size={32} color={colors.primary} />
            <Txt style={styles.emptyTitle}>{t("noBulletins")}</Txt>
            <Txt style={styles.emptyHint}>{t("noBulletinsHint")}</Txt>
          </DashedBox>
        ) : (
          <View style={{ gap: 20 }}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
        )}
      </View>
    </SiteScreen>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const { t, locale } = useI18n();
  const excerpt = articleCardExcerpt(article, locale);
  const date = formatArticleDate(article.published_at || article.created_at, locale);
  return (
    <Pressable
      onPress={() => router.navigate({ pathname: "/article/[slug]", params: { slug: article.slug } })}
      style={styles.card}
    >
      <View style={styles.cover}>
        {article.cover_url ? (
          <RemoteImage uri={article.cover_url} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Newspaper size={40} color={colors.primary} />
        )}
      </View>
      <View style={{ padding: 20 }}>
        {date ? <Txt style={styles.date}>{date}</Txt> : null}
        <Txt style={styles.title}>{articleTitle(article, locale)}</Txt>
        {excerpt ? (
          <Txt numberOfLines={3} style={styles.excerpt}>
            {excerpt}
          </Txt>
        ) : null}
        <Txt style={styles.read}>{t("readArticle")}</Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { borderBottomWidth: 1, borderBottomColor: colors.border60, paddingHorizontal: 16, paddingVertical: 48 },
  body: { paddingHorizontal: 16, paddingVertical: 40 },
  muted: { color: colors.mutedFg, ...text.base, textAlign: "center" },
  emptyTitle: { marginTop: 16, fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  emptyHint: { marginTop: 8, color: colors.mutedFg, ...text.sm, textAlign: "center" },
  card: {
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    boxShadow: shadows.card,
  },
  cover: { aspectRatio: 16 / 10, overflow: "hidden", backgroundColor: "#e8f3e4", alignItems: "center", justifyContent: "center" },
  date: { color: colors.mutedFg, fontFamily: fonts.body700, fontSize: 11, lineHeight: 16 },
  title: { marginTop: 8, fontFamily: fonts.display900, ...text.xl, lineHeight: 27.5 },
  excerpt: { marginTop: 8, color: colors.mutedFg, ...text.sm, lineHeight: 23 },
  read: { marginTop: 16, color: colors.primary, fontFamily: fonts.body800, ...text.sm },
});
