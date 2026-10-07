import type { Locale } from "@/i18n/messages";

const LATIN_DIGITS = "en-EG";

export function formatNumber(value: number) {
  return new Intl.NumberFormat(LATIN_DIGITS, { maximumFractionDigits: 0 }).format(value);
}

export function formatPrice(value: number, locale: Locale = "ar") {
  const amount = formatNumber(value);
  return locale === "en" ? `EGP ${amount}` : `${amount} ج.م`;
}

export function colorFor(id: string) {
  const palette = ["#7AB87A", "#A8D5BA", "#E8A87C", "#F4C95D", "#6FBF87", "#B5E0C1", "#9ED2A0", "#D9B68A"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  return palette[Math.abs(hash) % palette.length];
}

export function formatArticleDate(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function plainFromHtml(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function safeHtml(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (!/<\/?[a-z][\s\S]*>/i.test(raw)) {
    const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    return `<p>${escaped}</p>`;
  }
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/\u00a0/g, " ");
}
