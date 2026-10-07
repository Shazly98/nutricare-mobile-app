import { Platform, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import { safeHtml } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { colors, fonts, startAlign } from "@/theme";

const SYSTEM_FONTS = [fonts.body400, fonts.body700, fonts.body800, fonts.display800, fonts.display900];

export function HtmlBlock({ html }: { html: string }) {
  const { width } = useWindowDimensions();
  const { isRTL } = useI18n();
  const source = safeHtml(html);
  if (!source) return null;
  return (
    <RenderHTML
      contentWidth={width - 32}
      source={{ html: source }}
      systemFonts={SYSTEM_FONTS}
      baseStyle={{
        color: "rgba(16,31,19,0.8)",
        fontSize: 14,
        lineHeight: 22.75,
        fontFamily: fonts.body400,
        textAlign: startAlign(isRTL),
        writingDirection: isRTL ? "rtl" : "ltr",
      }}
      tagsStyles={{
        p: { marginTop: 8, marginBottom: 8 },
        a: { color: colors.primary, fontFamily: fonts.body700, textDecorationLine: "underline" },
        h1: { fontFamily: fonts.display900, fontSize: 24, lineHeight: 32, marginTop: 16, marginBottom: 8, color: colors.foreground },
        h2: { fontFamily: fonts.display900, fontSize: 20, lineHeight: 28, marginTop: 16, marginBottom: 8, color: colors.foreground },
        h3: { fontFamily: fonts.display800, fontSize: 18, lineHeight: 28, marginTop: 12, marginBottom: 8, color: colors.foreground },
        strong: { fontFamily: fonts.body800 },
        b: { fontFamily: fonts.body800 },
        ul: { marginTop: 8, marginBottom: 8 },
        ol: { marginTop: 8, marginBottom: 8 },
        blockquote:
          isRTL && Platform.OS === "web"
            ? { marginTop: 12, marginBottom: 12, borderRightWidth: 4, borderRightColor: colors.primary30, paddingRight: 12 }
          : { marginTop: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: colors.primary30, paddingLeft: 12 },
      }}
    />
  );
}
