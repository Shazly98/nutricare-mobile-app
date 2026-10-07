import { router, useLocalSearchParams } from "expo-router";
import { Newspaper } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { HtmlBlock } from "@/components/HtmlBlock";
import { SiteScreen } from "@/components/SiteScreen";
import { Breadcrumb, DashedBox, Pill, RemoteImage, Txt } from "@/components/ui";
import { usePublicArticle } from "@/lib/catalog";
import { formatArticleDate } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { articleBody, articleTitle } from "@/lib/localized";
import { colors, fonts, shadows, text } from "@/theme";

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, locale } = useI18n();
  const articleQuery = usePublicArticle(slug);
  const article = articleQuery.data;
  const title = article ? articleTitle(article, locale) : "";
  const html = article ? articleBody(article, locale) : "";
  const date = article ? formatArticleDate(article.published_at || article.created_at, locale) : "";

  return (
    <SiteScreen>
      <View style={styles.page}>
        <Breadcrumb
          items={[
            { label: t("navHome"), href: "/" },
            { label: t("navBulletin"), href: "/bulletin" },
            { label: title || t("readArticle") },
          ]}
        />

        {articleQuery.isLoading ? (
          <DashedBox style={{ marginTop: 40 }}>
            <Txt style={styles.muted}>{t("loadingBulletin")}</Txt>
          </DashedBox>
        ) : null}

        {!articleQuery.isLoading && !article ? (
          <DashedBox style={{ marginTop: 40 }}>
            <Newspaper size={32} color={colors.primary} />
            <Txt style={styles.missing}>{t("bulletinMissing")}</Txt>
            <Pill
              label={t("backToBulletin")}
              onPress={() => router.navigate("/bulletin")}
              style={{ marginTop: 24, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, boxShadow: "none" }}
            />
          </DashedBox>
        ) : null}

        {article ? (
          <View style={{ marginTop: 32 }}>
            {article.cover_url ? <RemoteImage uri={article.cover_url} style={styles.cover} /> : null}
            {date ? <Txt style={styles.date}>{date}</Txt> : null}
            <Txt style={styles.title}>{title}</Txt>
            {html ? (
              <View style={{ marginTop: 24 }}>
                <HtmlBlock html={html} />
              </View>
            ) : null}
            <Txt style={styles.disclaimer}>{t("bulletinDisclaimer")}</Txt>
          </View>
        ) : null}
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingVertical: 40 },
  muted: { color: colors.mutedFg, ...text.base, textAlign: "center" },
  missing: { marginTop: 16, fontFamily: fonts.body800, ...text.base, textAlign: "center" },
  cover: {
    marginBottom: 24,
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    boxShadow: shadows.card,
  },
  date: { color: colors.mutedFg, fontFamily: fonts.body700, ...text.xs },
  title: { marginTop: 8, fontFamily: fonts.display900, fontSize: 30, lineHeight: 40 },
  disclaimer: {
    marginTop: 32,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#e8f3e4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#14301c",
    ...text.sm,
    lineHeight: 23,
  },
});
