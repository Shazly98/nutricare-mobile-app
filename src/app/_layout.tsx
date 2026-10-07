import { Cairo_700Bold, Cairo_800ExtraBold, Cairo_900Black } from "@expo-google-fonts/cairo";
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  Tajawal_900Black,
} from "@expo-google-fonts/tajawal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppLoader } from "@/components/AppLoader";
import { CartDrawer } from "@/components/CartDrawer";
import { hasSupabase } from "@/config/env";
import { CartProvider } from "@/lib/cart";
import { LocaleProvider, useI18n } from "@/lib/locale";
import { ToastProvider } from "@/lib/toast";
import { colors, fonts } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_700Bold,
    Cairo_800ExtraBold,
    Cairo_900Black,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Tajawal_900Black,
  });

  const fontsReady = fontsLoaded || Boolean(fontError);
  const [appReady, setAppReady] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const markReady = useCallback(() => setAppReady(true), []);
  const hideLoader = useCallback(() => setLoaderVisible(false), []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <StatusBar style={loaderVisible ? "dark" : "light"} />
        {fontsReady ? (
          <QueryClientProvider client={queryClient}>
            <LocaleProvider>
              <DirectionRoot>
                <ToastProvider>
                  <CartProvider>
                    <RootStack onReady={markReady} />
                  </CartProvider>
                </ToastProvider>
              </DirectionRoot>
            </LocaleProvider>
          </QueryClientProvider>
        ) : null}
        {loaderVisible ? <AppLoader ready={fontsReady && appReady} fontsReady={fontsReady} onDone={hideLoader} /> : null}
      </View>
    </SafeAreaProvider>
  );
}

/** react-native-web resolves start/end styles from its own context, not from `<html dir>`. */
function DirectionRoot({ children }: { children: ReactNode }) {
  const { isRTL } = useI18n();
  const webDir = (Platform.OS === "web" ? { dir: isRTL ? "rtl" : "ltr" } : {}) as object;
  return (
    <View style={{ flex: 1 }} {...webDir}>
      {children}
    </View>
  );
}

function RootStack({ onReady }: { onReady: () => void }) {
  const { ready, t } = useI18n();
  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);
  if (!ready) return null;
  if (!hasSupabase) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 24 }}>
        <Text style={{ color: colors.foreground, fontFamily: fonts.body500, fontSize: 16, lineHeight: 26, textAlign: "center" }}>
          {t("missingConfig")}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <CartDrawer />
    </>
  );
}
