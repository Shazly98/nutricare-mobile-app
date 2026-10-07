import { router, useFocusEffect } from "expo-router";
import { Check, CheckCircle2, ChevronDown } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SiteScreen } from "@/components/SiteScreen";
import { Field, Input, Pill, Txt } from "@/components/ui";
import { buildCartOrderMessage, buildWhatsAppLink, EGYPT_GOVERNORATES, GOVERNORATE_EN } from "@/config/site";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/locale";
import { cartItemTitle } from "@/lib/localized";
import { submitOrder } from "@/lib/orders";
import { feeForGovernorate, isAlexandria, useShippingRates } from "@/lib/shipping";
import { useToast } from "@/lib/toast";
import { colors, endAlign, fonts, ltrProps, ltrStyle, shadows, startAlign, text } from "@/theme";

const EMPTY_FORM = { name: "", phone: "", phone2: "", governorate: "الإسكندرية", address: "", notes: "" };

export default function CheckoutScreen() {
  const cart = useCart();
  const toast = useToast();
  const { t, locale, isRTL } = useI18n();
  const insets = useSafeAreaInsets();
  const rates = useShippingRates();
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [whatsappHref, setWhatsappHref] = useState("");
  const [govOpen, setGovOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const shipping = cart.items.length === 0 ? 0 : feeForGovernorate(form.governorate, rates.data);
  const total = cart.subtotal + shipping;
  const govLabel = (g: string) => (locale === "en" ? GOVERNORATE_EN[g] ?? g : g);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setDone(false);
        setWhatsappHref("");
      };
    }, []),
  );

  async function onSubmit() {
    if (cart.items.length === 0) return toast.show(t("emptyCart"), "error");
    if (form.name.trim().length < 3) return toast.show(t("nameRequired"), "error");
    if (form.phone.trim().length < 10) return toast.show(t("phoneInvalid"), "error");
    if (!form.governorate) return toast.show(t("govRequired"), "error");
    if (form.address.trim().length < 8) return toast.show(t("addressRequired"), "error");

    const customer = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      phone2: form.phone2.trim() || undefined,
      governorate: form.governorate,
      address: form.address.trim(),
      notes: form.notes.trim() || undefined,
    };
    const whatsappLink = buildWhatsAppLink(buildCartOrderMessage(customer, cart.items, { subtotal: cart.subtotal, shipping, total }));

    setSending(true);
    try {
      await submitOrder({ customer, items: cart.items, subtotal: cart.subtotal, shipping, total });
    } catch {
      // The shop still gets the WhatsApp message, as on the website.
    } finally {
      toast.show(t("orderReceived"), "success");
      void Linking.openURL(whatsappLink).catch(() => undefined);
      setWhatsappHref(whatsappLink);
      cart.clear();
      setForm(EMPTY_FORM);
      setDone(true);
      setSending(false);
    }
  }

  if (!cart.hydrated) {
    return (
      <SiteScreen>
        <Txt style={[styles.sub, styles.centerBlock]}>{t("preparing")}</Txt>
      </SiteScreen>
    );
  }

  if (done) {
    return (
      <SiteScreen>
        <View style={styles.centerBlock}>
          <CheckCircle2 size={64} color={colors.primary} style={{ alignSelf: "center" }} />
          <Txt style={[styles.h1, { marginTop: 20, textAlign: "center" }]}>{t("orderSent")}</Txt>
          <Txt style={[styles.sub, { marginTop: 12, textAlign: "center", lineHeight: 23 }]}>{t("orderSentBody")}</Txt>
          <View style={styles.doneActions}>
            {whatsappHref ? (
              <Pill
                variant="whatsapp"
                label={t("sendOrderWhatsApp")}
                onPress={() => void Linking.openURL(whatsappHref)}
                style={styles.doneBtn}
              />
            ) : null}
            <Pill label={t("shopMore")} onPress={() => router.navigate("/products")} style={[styles.doneBtn, { boxShadow: "none" }]} />
            <Pill variant="outline" label={t("backHome")} onPress={() => router.navigate("/")} style={styles.doneBtn} />
          </View>
        </View>
      </SiteScreen>
    );
  }

  if (cart.items.length === 0) {
    return (
      <SiteScreen>
        <View style={styles.centerBlock}>
          <Txt style={[styles.h1, { textAlign: "center" }]}>{t("noItems")}</Txt>
          <Txt style={[styles.sub, { marginTop: 12, textAlign: "center" }]}>{t("noItemsHint")}</Txt>
          <Pill
            label={t("browse")}
            onPress={() => router.navigate("/products")}
            style={{ marginTop: 24, alignSelf: "center", paddingHorizontal: 20, boxShadow: "none" }}
          />
        </View>
      </SiteScreen>
    );
  }

  return (
    <SiteScreen>
      <View style={styles.page}>
        <Txt style={styles.h1}>{t("checkoutTitle")}</Txt>
        <Txt style={styles.sub}>{t("checkoutSub")}</Txt>

        <View style={{ marginTop: 32, gap: 24 }}>
          <View style={styles.card}>
            <Txt style={styles.cardTitle}>{t("customerData")}</Txt>
            <View style={{ marginTop: 20, gap: 16 }}>
              <Field label={t("fullName")}>
                <Input value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
              </Field>
              <Field label={t("phone")}>
                <Input ltr keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
              </Field>
              <Field label={t("phone2")}>
                <Input ltr keyboardType="phone-pad" value={form.phone2} onChangeText={(v) => setForm({ ...form, phone2: v })} />
              </Field>
              <Field label={t("governorate")}>
                <Pressable onPress={() => setGovOpen(true)} style={[styles.select, ltrStyle]} {...ltrProps}>
                  <Text style={[styles.selectText, { textAlign: "left" }]}>{govLabel(form.governorate)}</Text>
                  <ChevronDown size={16} color={colors.mutedFg} style={{ opacity: 0.5 }} />
                </Pressable>
              </Field>
              <Field label={t("address")}>
                <Input multiline minHeight={96} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
              </Field>
              <Field label={t("notes")}>
                <Input multiline minHeight={80} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} />
              </Field>
              <View style={styles.cod}>
                <Txt style={styles.codTitle}>{t("cod")}</Txt>
                <Txt style={styles.codHint}>{t("codHint")}</Txt>
              </View>
              <Pill
                full
                label={sending ? t("confirming") : t("confirmOrder")}
                disabled={sending}
                onPress={() => void onSubmit()}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Txt style={styles.cardTitle}>{t("invoice")}</Txt>
            <View style={{ marginTop: 20, gap: 16 }}>
              {cart.items.map((item) => {
                const line = item.price * item.quantity;
                const before = item.oldPrice != null && item.oldPrice > item.price ? item.oldPrice * item.quantity : null;
                return (
                  <View key={item.productId} style={styles.line}>
                    <View style={{ flex: 1 }}>
                      <Txt style={styles.lineTitle}>{cartItemTitle(item, locale)}</Txt>
                      <Txt style={styles.lineQty}>
                        {t("qty")}: {item.quantity}
                      </Txt>
                    </View>
                    <View>
                      {before != null ? (
                        <Txt style={[styles.lineBefore, { textAlign: endAlign(isRTL) }]}>{formatPrice(before, locale)}</Txt>
                      ) : null}
                      <Txt style={[styles.lineTotal, { textAlign: endAlign(isRTL) }]}>{formatPrice(line, locale)}</Txt>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.totals}>
              <Row label={t("subtotal")} value={formatPrice(cart.subtotal + cart.savings, locale)} />
              {cart.savings > 0 ? <Row label={t("discount")} value={`−${formatPrice(cart.savings, locale)}`} valueColor={colors.primary} /> : null}
              <Row label={t("shipping")} value={formatPrice(shipping, locale)} />
              <Txt style={styles.shipNote}>{isAlexandria(form.governorate) ? t("shipIn") : t("shipOut")}</Txt>
              <View style={styles.row}>
                <Text style={styles.grand}>{t("total")}</Text>
                <Text style={[styles.grand, { color: colors.primary }]}>{formatPrice(total, locale)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Modal visible={govOpen} transparent animationType="fade" onRequestClose={() => setGovOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setGovOpen(false)}>
          <View style={[styles.popover, { marginTop: insets.top + 24, marginBottom: insets.bottom + 24 }]}>
            <FlatList
              data={EGYPT_GOVERNORATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = item === form.governorate;
                return (
                  <Pressable
                    onPress={() => {
                      setForm({ ...form, governorate: item });
                      setGovOpen(false);
                    }}
                    style={[styles.option, selected && { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.optionText, { textAlign: startAlign(isRTL) }]}>{govLabel(item)}</Text>
                    {selected ? <Check size={16} color={colors.foreground} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </SiteScreen>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingVertical: 40 },
  centerBlock: { paddingHorizontal: 16, paddingVertical: 80 },
  h1: { fontFamily: fonts.display900, ...text["3xl"] },
  sub: { marginTop: 8, color: colors.mutedFg, ...text.sm },
  doneActions: { marginTop: 28, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  doneBtn: { paddingHorizontal: 20 },
  card: { borderRadius: 32, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 24, boxShadow: shadows.card },
  cardTitle: { fontFamily: fonts.display900, ...text.xl },
  select: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 14.4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 15.2,
    paddingVertical: 12,
  },
  selectText: { flex: 1, color: colors.foreground, fontFamily: fonts.body400, fontSize: 14.8 },
  cod: { borderRadius: 16, borderWidth: 1, borderColor: colors.primary20, backgroundColor: colors.primary5, padding: 16 },
  codTitle: { fontFamily: fonts.body800, ...text.base },
  codHint: { marginTop: 4, color: colors.mutedFg, ...text.xs },
  line: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  lineTitle: { fontFamily: fonts.body800, ...text.sm },
  lineQty: { color: colors.mutedFg, ...text.xs },
  lineBefore: { color: colors.mutedFg, fontFamily: fonts.body700, ...text.xs, textDecorationLine: "line-through" },
  lineTotal: { fontFamily: fonts.body800, ...text.sm },
  totals: { marginTop: 20, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: colors.mutedFg, fontFamily: fonts.body400, ...text.sm },
  rowValue: { color: colors.foreground, fontFamily: fonts.body800, ...text.sm },
  shipNote: { color: colors.mutedFg, fontSize: 11, lineHeight: 16 },
  grand: { color: colors.foreground, fontFamily: fonts.body900, ...text.base },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", paddingHorizontal: 24 },
  popover: {
    maxHeight: 420,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 4,
    boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
  },
  option: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 8 },
  optionText: { flex: 1, color: colors.foreground, fontFamily: fonts.body400, ...text.sm },
});
