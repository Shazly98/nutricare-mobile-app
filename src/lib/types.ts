export type Product = {
  id: string;
  name_ar: string;
  name_en: string | null;
  category_id: string | null;
  brand: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  short_description_ar: string | null;
  short_description_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  size: string | null;
  stock_status: string;
  stock_qty: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  icon: string | null;
  sort_order: number;
};

export type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  sort_order: number;
};

export type Article = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
};

export function isAvailable(product: { stock_status?: string | null; stock_qty?: number | null }) {
  if (product.stock_status === "out_of_stock") return false;
  if (typeof product.stock_qty === "number" && product.stock_qty <= 0) return false;
  return true;
}

export function discountPercent(price: number, oldPrice: number | null | undefined) {
  const before = Number(oldPrice);
  const after = Number(price);
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= after || before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}
