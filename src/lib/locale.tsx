import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DevSettings, I18nManager, Platform } from "react-native";
import { translate, type Locale, type MessageKey } from "@/i18n/messages";

const STORAGE_KEY = "nutricare-locale";

type LocaleContextValue = {
  locale: Locale;
  ready: boolean;
  isRTL: boolean;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  setLocale: (next: Locale) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyWebDirection(locale: Locale) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  if (!document.getElementById("nutricare-dir")) {
    // react-native-web marks root <Text> as dir="auto"; the site inherits the page direction instead.
    const style = document.createElement("style");
    style.id = "nutricare-dir";
    style.textContent = '[dir="auto"]:not(input):not(textarea) { direction: inherit; }';
    document.head.appendChild(style);
  }
}

async function reloadApp() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.location.reload();
    return;
  }
  if (__DEV__ && DevSettings.reload) {
    DevSettings.reload();
    return;
  }
  try {
    const Expo = await import("expo");
    if (typeof Expo.reloadAppAsync === "function") {
      await Expo.reloadAppAsync("locale-change");
    }
  } catch {
    // Direction is stored and applies on the next cold start.
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!active) return;
        const next: Locale = value === "en" ? "en" : "ar";
        setLocaleState(next);
        applyWebDirection(next);
        const wantRtl = next === "ar";
        if (Platform.OS !== "web" && I18nManager.isRTL !== wantRtl) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(wantRtl);
          void reloadApp();
          return;
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      ready,
      isRTL: locale === "ar",
      t: (key, vars) => translate(locale, key, vars),
      setLocale: async (next) => {
        await AsyncStorage.setItem(STORAGE_KEY, next);
        setLocaleState(next);
        applyWebDirection(next);
        const wantRtl = next === "ar";
        if (Platform.OS !== "web" && I18nManager.isRTL !== wantRtl) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(wantRtl);
          await reloadApp();
          return;
        }
        if (Platform.OS === "web") {
          await reloadApp();
        }
      },
    }),
    [locale, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
