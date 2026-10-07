export const WHATSAPP_NUMBER = "201220347356";
export const PHONE_DISPLAY = "0122 034 7356";
export const FACEBOOK_URL = "https://www.facebook.com/NutriCare2026";
export const INSTAGRAM_URL = "https://www.instagram.com/nutri_care100/";

export const GOVERNORATE_EN: Record<string, string> = {
  القاهرة: "Cairo",
  الجيزة: "Giza",
  الإسكندرية: "Alexandria",
  الدقهلية: "Dakahlia",
  "البحر الأحمر": "Red Sea",
  البحيرة: "Beheira",
  الفيوم: "Fayoum",
  الغربية: "Gharbia",
  الإسماعيلية: "Ismailia",
  المنوفية: "Monufia",
  المنيا: "Minya",
  القليوبية: "Qalyubia",
  "الوادي الجديد": "New Valley",
  السويس: "Suez",
  أسوان: "Aswan",
  أسيوط: "Assiut",
  "بني سويف": "Beni Suef",
  بورسعيد: "Port Said",
  دمياط: "Damietta",
  الشرقية: "Sharqia",
  "جنوب سيناء": "South Sinai",
  "كفر الشيخ": "Kafr El Sheikh",
  مطروح: "Matrouh",
  الأقصر: "Luxor",
  قنا: "Qena",
  "شمال سيناء": "North Sinai",
  سوهاج: "Sohag",
};

export const EGYPT_GOVERNORATES = Object.keys(GOVERNORATE_EN);

export const buildWhatsAppLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export type OrderCustomer = {
  name: string;
  phone: string;
  phone2?: string;
  governorate: string;
  address: string;
  notes?: string;
};

export type OrderLine = {
  name: string;
  quantity: number;
  price: number;
};

export function buildCartOrderMessage(
  customer: OrderCustomer,
  items: OrderLine[],
  totals: { subtotal: number; shipping: number; total: number },
) {
  const lines = items
    .map((item) => `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ج.م`)
    .join("\n");

  return [
    "طلب جديد من تطبيق NutriCare",
    "",
    `الاسم: ${customer.name}`,
    `الهاتف: ${customer.phone}`,
    customer.phone2 ? `هاتف إضافي: ${customer.phone2}` : null,
    `المحافظة: ${customer.governorate}`,
    `العنوان: ${customer.address}`,
    customer.notes ? `ملاحظات: ${customer.notes}` : null,
    "الدفع: معاينة ودفع عند الاستلام",
    "",
    "المنتجات:",
    lines,
    "",
    `المجموع: ${totals.subtotal} ج.م`,
    `الشحن: ${totals.shipping} ج.م`,
    `الإجمالي: ${totals.total} ج.م`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildContactMessage(data: { name: string; phone: string; email?: string; message: string }) {
  return ["رسالة تواصل من تطبيق NutriCare", "", `الاسم: ${data.name}`, `الهاتف: ${data.phone}`, data.email ? `البريد: ${data.email}` : null, "", data.message]
    .filter(Boolean)
    .join("\n");
}

export function buildProductOrderMessage(name: string, price: number) {
  return `مرحبًا، أريد الاستفسار من تطبيق NutriCare عن منتج: ${name} - السعر: ${price} جنيه`;
}
