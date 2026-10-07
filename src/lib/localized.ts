import type { Locale } from "@/i18n/messages";
import { plainFromHtml } from "@/lib/format";

export function pickText(locale: Locale, arabic?: string | null, english?: string | null) {
  const ar = arabic?.trim() ?? "";
  const en = english?.trim() ?? "";
  if (locale === "en") return en || ar;
  return ar || en;
}

export function productTitle(product: { name_ar: string; name_en?: string | null }, locale: Locale) {
  return pickText(locale, product.name_ar, product.name_en);
}

export function productBlurb(
  product: {
    short_description_ar?: string | null;
    description_ar?: string | null;
    short_description_en?: string | null;
    description_en?: string | null;
  },
  locale: Locale,
) {
  if (locale === "en") {
    return (
      plainFromHtml(product.short_description_en) ||
      plainFromHtml(product.description_en) ||
      plainFromHtml(product.short_description_ar) ||
      plainFromHtml(product.description_ar)
    );
  }
  return plainFromHtml(product.short_description_ar) || plainFromHtml(product.description_ar);
}

export function productFullHtml(
  product: { description_ar?: string | null; description_en?: string | null },
  locale: Locale,
) {
  if (locale === "en") return product.description_en?.trim() || product.description_ar?.trim() || "";
  return product.description_ar?.trim() || "";
}

export function categoryTitle(category: { name_ar: string; name_en?: string | null }, locale: Locale) {
  return pickText(locale, category.name_ar, category.name_en);
}

export function articleTitle(article: { title_ar: string; title_en?: string | null }, locale: Locale) {
  return pickText(locale, article.title_ar, article.title_en);
}

export function articleExcerpt(article: { excerpt_ar?: string | null; excerpt_en?: string | null }, locale: Locale) {
  return pickText(locale, article.excerpt_ar, article.excerpt_en);
}

export function articleBody(article: { body_ar?: string | null; body_en?: string | null }, locale: Locale) {
  if (locale === "en") return article.body_en?.trim() || article.body_ar?.trim() || "";
  return article.body_ar?.trim() || "";
}

export function articleCardExcerpt(
  article: { excerpt_ar?: string | null; excerpt_en?: string | null; body_ar?: string | null; body_en?: string | null },
  locale: Locale,
) {
  const explicit = articleExcerpt(article, locale);
  if (explicit) return explicit;
  const plain = plainFromHtml(articleBody(article, locale));
  if (plain.length <= 160) return plain;
  return `${plain.slice(0, 157)}…`;
}

export function productShortText(
  product: { short_description_ar?: string | null; short_description_en?: string | null },
  locale: Locale,
) {
  if (locale === "en") return plainFromHtml(product.short_description_en) || plainFromHtml(product.short_description_ar);
  return plainFromHtml(product.short_description_ar);
}

export function cartItemTitle(item: { name: string; nameAr?: string; nameEn?: string | null }, locale: Locale) {
  return pickText(locale, item.nameAr || item.name, item.nameEn || item.name);
}
