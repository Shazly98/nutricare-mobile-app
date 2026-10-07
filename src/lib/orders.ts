import { adminEmail, web3formsKey } from "@/config/env";
import { buildCartOrderMessage, buildContactMessage, type OrderCustomer } from "@/config/site";
import type { CartItem } from "@/lib/cart";
import { requireSupabase } from "@/lib/supabase";

export type OrderLineItem = {
  product_id: string;
  product_ids: string[];
  name: string;
  price: number;
  quantity: number;
  brand?: string | null;
  image_url?: string | null;
};

function uuid() {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef?.randomUUID) return cryptoRef.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function cartToOrderLines(items: CartItem[]): OrderLineItem[] {
  return items.flatMap((item) => {
    const productId = item.productId.trim();
    if (!productId) return [];
    return [
      {
        product_id: productId,
        product_ids: [productId],
        name: item.nameAr || item.name,
        price: item.price,
        quantity: item.quantity,
        brand: item.brand ?? null,
        image_url: item.imageUrl ?? null,
      },
    ];
  });
}

async function notifyAdminEmail(subject: string, message: string) {
  const email = adminEmail.trim();
  if (!email.includes("@")) return false;
  const key = web3formsKey.trim();
  if (!key) return false;
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: key, subject, from_name: "NutriCare", message }),
  });
  if (!res.ok) throw new Error("email");
  return true;
}

export async function submitOrder(input: {
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const lines = cartToOrderLines(input.items);
  if (lines.length === 0) throw new Error("لا توجد منتجات صالحة في الطلب");

  const notes = [input.customer.notes, "المصدر: تطبيق الموبايل"].filter(Boolean).join("\n");
  const payload = {
    id: uuid(),
    customer_name: input.customer.name,
    phone: input.customer.phone,
    phone2: input.customer.phone2 || null,
    governorate: input.customer.governorate,
    address: input.customer.address,
    notes,
    payment_method: "cod",
    items: lines,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    status: "new",
    is_read: false,
    source: "website",
  };

  const { error } = await requireSupabase().from("orders").insert(payload);
  if (error) throw error;

  const emailText = buildCartOrderMessage(input.customer, input.items, {
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
  });
  await notifyAdminEmail(`طلب جديد من التطبيق — ${input.customer.name}`, emailText).catch(() => false);
}

export async function submitContactMessage(input: { name: string; phone: string; email?: string; message: string }) {
  const { error } = await requireSupabase().from("contact_messages").insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    message: input.message.trim(),
  });
  await notifyAdminEmail(`رسالة تواصل من التطبيق — ${input.name}`, buildContactMessage(input)).catch(() => false);
  if (error) throw error;
}

export async function submitIherbRequest(input: { customer_name: string; phone: string; product_url: string }) {
  const { error } = await requireSupabase().from("iherb_requests").insert({
    customer_name: input.customer_name.trim(),
    phone: input.phone.trim(),
    product_url: input.product_url.trim(),
    status: "new",
    is_read: false,
  });
  await notifyAdminEmail(
    `طلب iHerb من التطبيق — ${input.customer_name}`,
    ["طلب منتج من iHerb عبر التطبيق", "", `الاسم: ${input.customer_name}`, `الهاتف: ${input.phone}`, `اللينك: ${input.product_url}`].join("\n"),
  ).catch(() => false);
  if (error) throw error;
}
