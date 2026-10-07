import { ArrowLeft, ArrowRight, ExternalLink, Link2, Phone, User } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { Gradient, Input, Txt } from "@/components/ui";
import { useI18n } from "@/lib/locale";
import { submitIherbRequest } from "@/lib/orders";
import { useToast } from "@/lib/toast";
import { colors, fonts, ltrProps, ltrStyle, shadows, text } from "@/theme";

const IHERB_EG_URL = "https://eg.iherb.com/";

function Glow({ size, color, opacity, style }: { size: number; color: string; opacity: number; style: ViewStyle }) {
  const id = `glow-${color.replace("#", "")}`;
  return (
    <View style={[{ position: "absolute", width: size, height: size, pointerEvents: "none" }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function FieldLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={styles.labelRow}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const inlinePill: ViewStyle = Platform.OS === "web" ? ({ display: "inline-flex" } as unknown as ViewStyle) : {};

export function IHerbSection() {
  const { t, isRTL } = useI18n();
  const toast = useToast();
  const [form, setForm] = useState({ product_url: "", customer_name: "", phone: "" });
  const [sending, setSending] = useState(false);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  async function onSubmit() {
    const name = form.customer_name.trim();
    const phone = form.phone.trim();
    const url = form.product_url.trim();

    if (name.length < 2) return toast.show(t("writeName"), "error");
    if (phone.length < 10) return toast.show(t("phoneWrong"), "error");
    if (!/^https?:\/\/.+/i.test(url)) return toast.show(t("urlWrong"), "error");

    setSending(true);
    try {
      await submitIherbRequest({ customer_name: name, phone, product_url: url });
      toast.show(t("iherbOk"), "success");
      setForm({ product_url: "", customer_name: "", phone: "" });
    } catch (err) {
      toast.show(err instanceof Error ? err.message : t("iherbFail"), "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.section}>
      <Glow size={288} color="#1f8a34" opacity={0.25} style={{ top: -96, left: 0 }} />
      <Glow size={320} color={colors.lime} opacity={0.1} style={{ bottom: -112, right: 40 }} />

      <View>
        <Txt style={styles.kicker}>IHERB · SPECIAL ORDER</Txt>
        <Txt style={styles.h2}>
          {t("iherbTitle")}
          {"\n"}
          <Text style={{ color: colors.lime }}>{t("iherbAccent")}</Text>
        </Txt>
        <Txt style={styles.body}>
          {t("iherbBody")}{" "}
          <View style={[styles.monthPill, inlinePill]}>
            <Text style={styles.monthText}>{t("withinMonth")}</Text>
          </View>
        </Txt>

        <Pressable onPress={() => void Linking.openURL(IHERB_EG_URL)} style={styles.siteBtn} {...ltrProps}>
          <ExternalLink size={16} color={colors.lime} />
          <Text style={styles.siteText}>eg.iherb.com</Text>
        </Pressable>

        <View style={styles.steps}>
          {[
            { n: "01", label: t("iherb1") },
            { n: "02", label: t("iherb2") },
            { n: "03", label: t("iherb3") },
          ].map((step) => (
            <View key={step.n} style={styles.step}>
              <Text style={styles.stepNum}>{step.n}</Text>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.formHead}>
          <View style={{ flexShrink: 1 }}>
            <Txt style={styles.formKicker}>{t("requestData")}</Txt>
            <Txt style={styles.formTitle}>{t("sendLink")}</Txt>
          </View>
          <Pressable onPress={() => void Linking.openURL(IHERB_EG_URL)} style={styles.smallLink} {...ltrProps}>
            <Text style={styles.smallLinkText}>eg.iherb.com</Text>
            <ExternalLink size={12} color={colors.iherbBg} />
          </Pressable>
        </View>

        <View style={{ gap: 14 }}>
          <View>
            <FieldLabel icon={<Link2 size={14} color={colors.primary} />} label={t("productLink")} />
            <Input
              ltr
              placeholder="https://eg.iherb.com/pr/..."
              value={form.product_url}
              onChangeText={(value) => setForm({ ...form, product_url: value })}
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
            />
          </View>
          <View>
            <FieldLabel icon={<User size={14} color={colors.primary} />} label={t("nameStar")} />
            <Input
              placeholder={t("yourName")}
              value={form.customer_name}
              onChangeText={(value) => setForm({ ...form, customer_name: value })}
              style={styles.input}
            />
          </View>
          <View>
            <FieldLabel icon={<Phone size={14} color={colors.primary} />} label={t("phoneStar")} />
            <Input
              ltr
              placeholder="01xxxxxxxxx"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(value) => setForm({ ...form, phone: value })}
              style={styles.input}
            />
          </View>

          <Pressable onPress={() => void onSubmit()} disabled={sending} style={[{ marginTop: 8 }, sending && { opacity: 0.6 }]}>
            <Gradient style={styles.submit}>
              <Text style={styles.submitText}>{sending ? t("sending") : t("sendRequest")}</Text>
              {!sending ? <Arrow size={16} color={colors.primaryFg} /> : null}
            </Gradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { overflow: "hidden", backgroundColor: colors.iherbBg, paddingHorizontal: 16, paddingVertical: 64, gap: 40 },
  kicker: { color: colors.lime, fontFamily: fonts.body800, fontSize: 11, letterSpacing: 2 },
  h2: { marginTop: 16, color: colors.white, fontFamily: fonts.display900, fontSize: 30, lineHeight: 40 },
  body: { marginTop: 20, color: "rgba(255,255,255,0.7)", ...text.base, lineHeight: 28 },
  monthPill: { borderRadius: 999, backgroundColor: colors.lime, paddingHorizontal: 10, paddingVertical: 2 },
  monthText: { color: colors.iherbBg, fontFamily: fonts.body900, ...text.sm },
  siteBtn: {
    marginTop: 24,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(198,238,74,0.4)",
    backgroundColor: "rgba(198,238,74,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...ltrStyle,
  },
  siteText: { color: colors.lime, fontFamily: fonts.body800, ...text.sm },
  steps: { marginTop: 36, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  step: {
    minWidth: 152,
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepNum: { color: "rgba(198,238,74,0.8)", fontFamily: fonts.display900, ...text.lg },
  stepLabel: { flexShrink: 1, color: "rgba(255,255,255,0.9)", fontFamily: fonts.body800, ...text.sm },
  form: { borderRadius: 28, backgroundColor: colors.white, padding: 20, boxShadow: "0px 24px 60px 0px rgba(0,0,0,0.28)" },
  formHead: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerLine,
    paddingBottom: 16,
  },
  formKicker: { color: colors.primary, fontFamily: fonts.body800, ...text.xs },
  formTitle: { marginTop: 4, fontFamily: fonts.display900, ...text.xl },
  smallLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: colors.searchBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...ltrStyle,
  },
  smallLinkText: { color: colors.iherbBg, fontFamily: fonts.body800, fontSize: 11 },
  labelRow: { marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  label: { color: "rgba(16,31,19,0.65)", fontFamily: fonts.body800, ...text.xs },
  input: { borderRadius: 16, borderColor: colors.searchLine, backgroundColor: colors.searchBg },
  submit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
    boxShadow: shadows.soft,
  },
  submitText: { color: colors.primaryFg, fontFamily: fonts.body800, ...text.sm },
});
