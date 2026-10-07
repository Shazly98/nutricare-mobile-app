import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Fragment, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useI18n } from "@/lib/locale";
import { colors, fonts, gradients, shadows, startAlign, text } from "@/theme";

const LOGO = require("../../assets/images/logo.png");

export function Txt({ style, ...props }: TextProps) {
  const { isRTL } = useI18n();
  return (
    <Text
      {...props}
      style={[{ color: colors.foreground, fontFamily: fonts.body400, textAlign: startAlign(isRTL) }, style]}
    />
  );
}

export function BrandLogo({ size }: { size: number }) {
  return <Image source={LOGO} style={{ width: size, height: size }} contentFit="contain" />;
}

export function Gradient({
  style,
  children,
  soft,
}: {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  soft?: boolean;
}) {
  return (
    <LinearGradient
      colors={soft ? gradients.soft : gradients.primary}
      start={{ x: 0, y: 0 }}
      end={soft ? { x: 0, y: 1 } : { x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

type PillVariant = "gradient" | "outline" | "white" | "dark" | "green" | "whatsapp" | "ghostWhite" | "outlinePrimary";

export function Pill({
  label,
  onPress,
  variant = "gradient",
  icon,
  trailingIcon,
  style,
  textStyle,
  disabled,
  full,
}: {
  label: string;
  onPress?: () => void;
  variant?: PillVariant;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  full?: boolean;
}) {
  const content = (
    <>
      {icon}
      <Text style={[styles.pillText, pillText[variant], textStyle]}>{label}</Text>
      {trailingIcon}
    </>
  );
  const shell: StyleProp<ViewStyle> = [styles.pill, full && styles.full, pillShell[variant], style, disabled && styles.disabled];

  if (variant === "gradient") {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={[full && styles.full, disabled && styles.disabled]}>
        <Gradient style={[styles.pill, full && styles.full, { boxShadow: shadows.soft }, style]}>{content}</Gradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={disabled} style={shell}>
      {content}
    </Pressable>
  );
}

const pillShell: Record<PillVariant, ViewStyle> = {
  gradient: {},
  outline: { borderWidth: 1, borderColor: colors.border },
  white: { backgroundColor: colors.card },
  dark: { backgroundColor: colors.offerInk },
  green: { backgroundColor: colors.addGreen },
  whatsapp: { backgroundColor: colors.whatsapp },
  ghostWhite: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  outlinePrimary: { borderWidth: 1, borderColor: colors.primary40, backgroundColor: colors.card },
};

const pillText: Record<PillVariant, TextStyle> = {
  gradient: { color: colors.primaryFg },
  outline: { color: colors.foreground },
  white: { color: colors.primary },
  dark: { color: colors.white },
  green: { color: colors.white },
  whatsapp: { color: colors.white },
  ghostWhite: { color: colors.primaryFg },
  outlinePrimary: { color: colors.primary },
};

export function Eyebrow({ label, icon, style, textStyle }: { label: string; icon?: ReactNode; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={[styles.eyebrow, style]}>
      {icon}
      <Text style={[styles.eyebrowText, textStyle]}>{label}</Text>
    </View>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  eyebrowIcon,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  eyebrowIcon?: ReactNode;
}) {
  const center = align === "center";
  const textAlign: TextStyle = center ? { textAlign: "center" } : {};
  return (
    <View style={[styles.heading, { alignItems: center ? "center" : "flex-start" }]}>
      {eyebrow ? <Eyebrow label={eyebrow} icon={eyebrowIcon} style={center ? { alignSelf: "center" } : undefined} /> : null}
      <Txt style={[styles.h2, textAlign]}>{title}</Txt>
      {subtitle ? <Txt style={[styles.sub, textAlign]}>{subtitle}</Txt> : null}
    </View>
  );
}

export function ArrowLink({ label, onPress, color = colors.primary }: { label: string; onPress: () => void; color?: string }) {
  const { isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  return (
    <Pressable onPress={onPress} style={styles.arrowLink}>
      <Text style={[styles.arrowText, { color }]}>{label}</Text>
      <Arrow size={16} color={color} />
    </Pressable>
  );
}

export type Crumb = { label: string; href?: Href };

export function Breadcrumb({ items, style }: { items: Crumb[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.crumbs, style]}>
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 ? <Text style={styles.crumbSep}>/</Text> : null}
          {item.href ? (
            <Pressable onPress={() => router.navigate(item.href!)}>
              <Text style={styles.crumb}>{item.label}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.crumb, styles.crumbLast]} numberOfLines={1}>
              {item.label}
            </Text>
          )}
        </Fragment>
      ))}
    </View>
  );
}

export function Field({ label, children, labelStyle }: { label: ReactNode; children: ReactNode; labelStyle?: StyleProp<TextStyle> }) {
  return (
    <View>
      {typeof label === "string" ? <Txt style={[styles.fieldLabel, labelStyle]}>{label}</Txt> : label}
      {children}
    </View>
  );
}

/** Mirrors the site's `.field` utility. */
export function Input({
  ltr,
  minHeight,
  style,
  ...props
}: TextInputProps & { ltr?: boolean; minHeight?: number }) {
  const { isRTL } = useI18n();
  const rtl = isRTL && !ltr;
  const align: TextStyle =
    Platform.OS === "web" ? { textAlign: rtl ? "right" : "left" } : ltr ? { textAlign: "left" } : {};
  return (
    <TextInput
      placeholderTextColor={colors.mutedFg}
      {...props}
      style={[
        styles.input,
        props.multiline && { minHeight: minHeight ?? 96, textAlignVertical: "top" },
        align,
        { writingDirection: rtl ? "rtl" : "ltr" },
        style,
      ]}
    />
  );
}

export function DashedBox({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.dashed, style]}>{children}</View>;
}

export function RemoteImage({
  uri,
  style,
  fit = "cover",
}: {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  fit?: "cover" | "contain";
}) {
  if (!uri) return <View style={style} />;
  return <Image source={{ uri }} style={style as never} contentFit={fit} transition={150} />;
}

export function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <DashedBox>
      <Txt style={[styles.centerTitle]}>{t("loadError")}</Txt>
      <Pill label={t("retry")} onPress={onRetry} style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20 }} />
    </DashedBox>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  full: { alignSelf: "stretch", width: "100%" },
  pillText: { fontFamily: fonts.body800, ...text.sm },
  disabled: { opacity: 0.6 },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.primary10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  eyebrowText: { color: colors.primary, fontFamily: fonts.body800, fontSize: 11, lineHeight: 16 },
  heading: { gap: 8 },
  h2: { fontFamily: fonts.display900, ...text["3xl"] },
  sub: { color: colors.mutedFg, ...text.sm, lineHeight: 23 },
  arrowLink: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" },
  arrowText: { fontFamily: fonts.body800, ...text.sm },
  crumbs: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  crumb: { color: colors.mutedFg, fontFamily: fonts.body700, ...text.xs },
  crumbLast: { flexShrink: 1 },
  crumbSep: { color: colors.mutedFg, fontFamily: fonts.body700, ...text.xs, marginHorizontal: 8 },
  fieldLabel: { fontFamily: fonts.body700, ...text.xs, marginBottom: 6 },
  input: {
    width: "100%",
    borderRadius: 14.4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 15.2,
    fontSize: 14.8,
    color: colors.foreground,
    fontFamily: fonts.body400,
  },
  dashed: {
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  centerTitle: { fontFamily: fonts.body800, ...text.base, textAlign: "center" },
});
