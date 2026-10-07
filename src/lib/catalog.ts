import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { requireSupabase } from "@/lib/supabase";
import { isAvailable, type Article, type Brand, type Category, type Product } from "@/lib/types";

export const PUBLIC_PRODUCTS_PAGE_SIZE = 24;

function sanitizeSearch(q: string) {
  return q.replace(/[%_,.()"]/g, " ").trim();
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ["public", "categories"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("categories")
        .select("id, slug, name_ar, name_en, icon, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function usePublicProducts() {
  return useQuery({
    queryKey: ["public", "products"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

export function useInfinitePublicProducts(opts: { category?: string; q?: string }) {
  const category = opts.category && opts.category !== "all" ? opts.category : undefined;
  const q = opts.q ? sanitizeSearch(opts.q) : "";

  return useInfiniteQuery({
    queryKey: ["public", "products", "infinite", { category: category ?? "all", q }],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = pageParam;
      const to = from + PUBLIC_PRODUCTS_PAGE_SIZE - 1;
      let query = requireSupabase()
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to);

      if (category) query = query.eq("category_id", category);
      if (q) {
        query = query.or(
          `name_ar.ilike.%${q}%,name_en.ilike.%${q}%,brand.ilike.%${q}%,short_description_ar.ilike.%${q}%,short_description_en.ilike.%${q}%`,
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        items: (data ?? []) as Product[],
        count: count ?? 0,
        nextFrom: from + PUBLIC_PRODUCTS_PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.nextFrom < lastPage.count ? lastPage.nextFrom : undefined),
  });
}

export function usePublicBrands() {
  return useQuery({
    queryKey: ["public", "brands"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("brands")
        .select("id, name, logo_url, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Brand[];
    },
  });
}

export function usePublicArticles() {
  return useQuery({
    queryKey: ["public", "articles"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("articles")
        .select("id, slug, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, cover_url, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });
}

export function usePublicArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ["public", "article", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("articles")
        .select("id, slug, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, cover_url, published_at, created_at")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Article | null) ?? null;
    },
  });
}

export function usePublicOffers() {
  return useQuery({
    queryKey: ["public", "offers"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("old_price", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as Product[]).filter((product) => {
        const before = Number(product.old_price);
        const after = Number(product.price);
        if (!Number.isFinite(before) || !Number.isFinite(after) || before <= after) return false;
        return isAvailable(product);
      });
    },
  });
}

export function usePublicProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["public", "product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("products")
        .select("*")
        .eq("id", id!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data as Product | null) ?? null;
    },
  });
}
