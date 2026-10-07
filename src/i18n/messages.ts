import { translate as translateSite, type Locale, type MessageKey as SiteKey } from "@/i18n/site-messages";

export type { Locale };

/** Strings the app needs that the website does not have. */
const extraAr = {
  missingConfig: "التطبيق غير مربوط بقاعدة البيانات. أضف مفاتيح Supabase في ملف mobile-app/.env ثم أعد التشغيل.",
  loadError: "تعذر تحميل البيانات. تأكد من الاتصال وحاول مرة أخرى.",
  retry: "إعادة المحاولة",
  close: "إغلاق",
  chooseGov: "اختر المحافظة",
};

const extraEn: Record<keyof typeof extraAr, string> = {
  missingConfig: "The app is not connected to the database. Add the Supabase keys in mobile-app/.env and restart.",
  loadError: "Could not load data. Check your connection and try again.",
  retry: "Try again",
  close: "Close",
  chooseGov: "Choose a governorate",
};

export type MessageKey = SiteKey | keyof typeof extraAr;

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>) {
  if (key in extraAr) {
    const template = (locale === "en" ? extraEn : extraAr)[key as keyof typeof extraAr];
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
  }
  return translateSite(locale, key as SiteKey, vars);
}
