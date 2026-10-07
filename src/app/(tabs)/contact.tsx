import { Clock3, Send } from "lucide-react-native";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { SiteScreen } from "@/components/SiteScreen";
import { Field, Gradient, Input, SectionHeading, Txt } from "@/components/ui";
import { buildContactMessage, buildWhatsAppLink, FACEBOOK_URL, INSTAGRAM_URL, PHONE_DISPLAY } from "@/config/site";
import { useI18n } from "@/lib/locale";
import { submitContactMessage } from "@/lib/orders";
import { useToast } from "@/lib/toast";
import { colors, fonts, shadows, text } from "@/theme";

const EMPTY = { name: "", phone: "", email: "", message: "" };

export default function ContactScreen() {
  const { t } = useI18n();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);

  async function onSubmit() {
    if (form.name.trim().length < 3) return toast.show(t("contactNameRequired"), "error");
    if (form.phone.trim().length < 10) return toast.show(t("phoneInvalid"), "error");
    if (form.message.trim().length < 8) return toast.show(t("contactMessageRequired"), "error");

    setSending(true);
    try {
      await submitContactMessage(form);
      toast.show(t("contactSent"), "success");
    } catch {
      toast.show(t("contactFallback"), "message");
    } finally {
      void Linking.openURL(buildWhatsAppLink(buildContactMessage(form))).catch(() => undefined);
      setForm(EMPTY);
      setSending(false);
    }
  }

  return (
    <SiteScreen>
      <Gradient soft style={styles.head}>
        <SectionHeading align="start" eyebrow={t("contactEyebrow")} title={t("contactTitle")} subtitle={t("contactSub")} />
      </Gradient>

      <View style={styles.body}>
        <View style={styles.form}>
          <View>
            <Txt style={styles.formTitle}>{t("sendData")}</Txt>
            <Txt style={styles.formHint}>{t("sendHint")}</Txt>
          </View>

          <View style={{ marginTop: 28, gap: 16 }}>
            <Field label={t("fullName")} labelStyle={styles.label}>
              <Input value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder={t("namePlaceholder")} />
            </Field>
            <Field label={t("phoneLabel")} labelStyle={styles.label}>
              <Input ltr keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="01xxxxxxxxx" />
            </Field>
            <Field label={t("email")} labelStyle={styles.label}>
              <Input
                ltr
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                placeholder="optional@email.com"
              />
            </Field>
            <Field label={t("message")} labelStyle={styles.label}>
              <Input
                multiline
                minHeight={144}
                value={form.message}
                onChangeText={(v) => setForm({ ...form, message: v })}
                placeholder={t("messagePlaceholder")}
              />
            </Field>

            <Pressable onPress={() => void onSubmit()} disabled={sending} style={[{ marginTop: 4 }, sending && { opacity: 0.6 }]}>
              <Gradient style={styles.submit}>
                <Send size={16} color={colors.primaryFg} />
                <Text style={styles.submitText}>{sending ? t("sending") : t("sendMessage")}</Text>
              </Gradient>
            </Pressable>
          </View>
        </View>

        <View style={styles.aside}>
          <View style={styles.asideHead}>
            <Txt style={styles.asideKicker}>{t("contactWays")}</Txt>
            <Txt style={styles.asideTitle}>{t("contactDirect")}</Txt>
          </View>

          <View style={styles.item}>
            <View style={styles.itemRow}>
              <Gradient style={styles.iconBox}>
                <WhatsAppIcon size={20} color={colors.primaryFg} />
              </Gradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt style={styles.itemTitle}>{t("whatsapp")}</Txt>
                <Txt style={[styles.itemSub, { writingDirection: "ltr" }]}>{PHONE_DISPLAY}</Txt>
              </View>
            </View>
            <Pressable onPress={() => void Linking.openURL(buildWhatsAppLink(t("waHello")))} style={{ marginTop: 12 }}>
              <Gradient style={styles.chatBtn}>
                <WhatsAppIcon size={14} color={colors.primaryFg} />
                <Text style={styles.chatText}>{t("startChat")}</Text>
              </Gradient>
            </Pressable>
          </View>

          <View style={[styles.item, styles.divider]}>
            <View style={styles.itemRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary10 }]}>
                <Clock3 size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={styles.itemTitle}>{t("hours")}</Txt>
                <Txt style={styles.itemSub}>{t("days")}</Txt>
                <Txt style={[styles.hoursTime, { writingDirection: "ltr" }]}>{t("hoursTime")}</Txt>
              </View>
            </View>
          </View>

          <View style={[styles.item, styles.divider]}>
            <Txt style={styles.socialTitle}>{t("social")}</Txt>
            <View style={styles.socialRow}>
              <Pressable onPress={() => void Linking.openURL(FACEBOOK_URL)} style={styles.socialBtn}>
                <FacebookIcon size={14} color={colors.primary} />
                <Text style={styles.socialText}>{t("facebook")}</Text>
              </Pressable>
              <Pressable onPress={() => void Linking.openURL(INSTAGRAM_URL)} style={styles.socialBtn}>
                <InstagramIcon size={14} color={colors.primary} />
                <Text style={styles.socialText}>{t("instagram")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SiteScreen>
  );
}

const styles = StyleSheet.create({
  head: { borderBottomWidth: 1, borderBottomColor: colors.border60, paddingHorizontal: 16, paddingVertical: 40 },
  body: { paddingHorizontal: 16, paddingVertical: 40, gap: 24 },
  form: { borderRadius: 28, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24, boxShadow: shadows.card },
  formTitle: { fontFamily: fonts.display900, ...text["2xl"] },
  formHint: { marginTop: 6, color: colors.mutedFg, ...text.sm, lineHeight: 23 },
  label: { color: "rgba(16,31,19,0.9)" },
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
  aside: { overflow: "hidden", borderRadius: 28, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, boxShadow: shadows.card },
  asideHead: { borderBottomWidth: 1, borderBottomColor: "rgba(218,225,211,0.7)", backgroundColor: colors.primary5, paddingHorizontal: 20, paddingVertical: 16 },
  asideKicker: { color: colors.primary, fontFamily: fonts.body800, fontSize: 11, lineHeight: 16, letterSpacing: 0.3 },
  asideTitle: { marginTop: 2, fontFamily: fonts.body700, ...text.sm },
  item: { padding: 16 },
  divider: { borderTopWidth: 1, borderTopColor: "rgba(218,225,211,0.7)" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  itemTitle: { fontFamily: fonts.body800, ...text.sm },
  itemSub: { marginTop: 2, color: colors.mutedFg, ...text.xs },
  hoursTime: { color: "rgba(16,31,19,0.8)", fontFamily: fonts.body700, ...text.xs },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chatText: { color: colors.primaryFg, fontFamily: fonts.body800, ...text.xs },
  socialTitle: { marginBottom: 12, color: colors.mutedFg, fontFamily: fonts.body800, ...text.xs },
  socialRow: { flexDirection: "row", gap: 8 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  socialText: { color: colors.primary, fontFamily: fonts.body800, ...text.xs },
});
