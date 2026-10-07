import { Image, type ImageContentPosition } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Txt } from "@/components/ui";
import { useI18n } from "@/lib/locale";
import { fonts } from "@/theme";

export function CatalogHero({
  image,
  position,
  overlay,
  crumb,
  pill,
  title,
  subtitle,
}: {
  image: number;
  position: ImageContentPosition;
  overlay: "vertical" | "side";
  crumb: string;
  pill: string;
  title: string;
  subtitle: string;
}) {
  const { t, isRTL } = useI18n();
  const veil = "rgba(253,251,247,";

  return (
    <View style={styles.hero}>
      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={position} />
      {overlay === "vertical" ? (
        <LinearGradient
          colors={[`${veil}0.55)`, `${veil}0.25)`, `${veil}0.45)`]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <LinearGradient
          colors={[`${veil}0.82)`, `${veil}0.45)`, `${veil}0)`]}
          locations={[0, 0.38, 0.68]}
          start={isRTL ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 }}
          end={isRTL ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.content}>
        <View style={styles.crumbs}>
          <Pressable onPress={() => router.navigate("/")}>
            <Text style={styles.crumb}>{t("navHome")}</Text>
          </Pressable>
          <Text style={styles.crumb}>/</Text>
          <Text style={[styles.crumb, { color: "#1A2421" }]}>{crumb}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{pill}</Text>
        </View>
        <Txt style={styles.h1}>{title}</Txt>
        <Txt style={styles.sub}>{subtitle}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, width: "100%", overflow: "hidden", borderBottomWidth: 1, borderBottomColor: "#e8eee4" },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 16, maxWidth: 448 },
  crumbs: { marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  crumb: { color: "#8E8E8E", fontFamily: fonts.body700, fontSize: 13, lineHeight: 18 },
  pill: { alignSelf: "flex-start", borderRadius: 999, backgroundColor: "#E8F3E9", paddingHorizontal: 14, paddingVertical: 4 },
  pillText: { color: "#4A7C59", fontFamily: fonts.body800, fontSize: 12, lineHeight: 16 },
  h1: { marginTop: 10, color: "#1A2421", fontFamily: fonts.display900, fontSize: 28, lineHeight: 36, letterSpacing: -0.4 },
  sub: { marginTop: 8, color: "#6F7A74", fontFamily: fonts.body500, fontSize: 14, lineHeight: 22.75 },
});
