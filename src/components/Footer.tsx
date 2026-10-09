import { router, type Href } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Linking, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WhatsAppIcon } from "@/components/icons";
import { BrandLogo, Gradient, Txt } from "@/components/ui";
import { buildWhatsAppLink, FACEBOOK_URL, INSTAGRAM_URL } from "@/config/site";
import { useI18n } from "@/lib/locale";
import { TAB_BAR_HEIGHT } from "@/components/MobileTabBar";
import { colors, fonts, shadows, text } from "@/theme";

export function Footer() {
  const { t } = useI18n();
  const quick: { label: string; href: Href }[] = [
    { label: t("navHome"), href: "/" },
    { label: t("navProducts"), href: "/products" },
    { label: t("navOffers"), href: "/offers" },
    { label: t("navBulletin"), href: "/bulletin" },
    { label: t("navIherb"), href: "/iherb" },
    { label: t("navCart"), href: "/cart" },
    { label: t("navContact"), href: "/contact" },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <View>
          <View style={styles.brandRow}>
            <BrandLogo size={96} />
            <View>
              <Txt style={styles.brand}>NutriCare</Txt>
              <Txt style={styles.tagline}>Nourishing Life, Naturally</Txt>
            </View>
          </View>
          <Txt style={styles.blurb}>{t("footerBlurb")}</Txt>
        </View>

        <View>
          <Txt style={styles.h4}>{t("quickLinks")}</Txt>
          <View style={styles.list}>
            {quick.map((link) => (
              <Pressable key={link.label} onPress={() => router.navigate(link.href)}>
                <Txt style={styles.link}>{link.label}</Txt>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Txt style={styles.h4}>{t("follow")}</Txt>
          <View style={styles.list}>
            <Pressable onPress={() => void Linking.openURL(FACEBOOK_URL)}>
              <Txt style={styles.link}>{t("facebook")}</Txt>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL(INSTAGRAM_URL)}>
              <Txt style={styles.link}>{t("instagram")}</Txt>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL(buildWhatsAppLink(t("waHi")))} style={styles.waRow}>
              <WhatsAppIcon size={16} color={colors.mutedFg} />
              <Txt style={styles.link}>{t("whatsapp")}</Txt>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.bottom}>
        <Txt style={styles.legal}>
          {t("disclaimer")}
          {"\n"}© {new Date().getFullYear()} NutriCare — {t("rights")}
        </Txt>
      </View>
    </View>
  );
}

export function FloatingWhatsApp() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Animated.View style={[styles.fab, { bottom: TAB_BAR_HEIGHT + insets.bottom + 84, transform: [{ translateY }] }]}>
      <Pressable onPress={() => void Linking.openURL(buildWhatsAppLink(t("waHello")))} accessibilityLabel={t("waFloat")}>
        <Gradient style={styles.fabInner}>
          <WhatsAppIcon size={28} color={colors.primaryFg} />
        </Gradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  inner: { paddingHorizontal: 16, paddingVertical: 48, gap: 32 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brand: { color: colors.primary, fontFamily: fonts.display800, ...text.lg },
  tagline: { color: colors.mutedFg, ...text.xs },
  blurb: { marginTop: 16, color: colors.mutedFg, ...text.sm, lineHeight: 23 },
  h4: { fontFamily: fonts.display800, ...text.base },
  list: { marginTop: 12, gap: 8 },
  link: { color: colors.mutedFg, ...text.sm },
  waRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bottom: { borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 20 },
  legal: { color: colors.mutedFg, ...text.xs, textAlign: "center" },
  fab: { position: "absolute", end: 16, zIndex: 40, borderRadius: 999, boxShadow: shadows.soft },
  fabInner: { width: 56, height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center" },
});
