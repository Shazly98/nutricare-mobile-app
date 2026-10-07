import { useQuery } from "@tanstack/react-query";
import { requireSupabase } from "@/lib/supabase";

export const ALEXANDRIA_GOVERNORATE = "الإسكندرية";

export const DEFAULT_SHIPPING_RATES = {
  alexandria: 50,
  outside: 90,
};

export type ShippingRates = typeof DEFAULT_SHIPPING_RATES;

export function isAlexandria(governorate: string) {
  const value = governorate.trim();
  return value === ALEXANDRIA_GOVERNORATE || value.includes("اسكندر") || value.includes("إسكندر");
}

export function feeForGovernorate(governorate: string, rates?: ShippingRates) {
  const next = rates ?? DEFAULT_SHIPPING_RATES;
  return isAlexandria(governorate) ? next.alexandria : next.outside;
}

export function useShippingRates() {
  return useQuery({
    queryKey: ["public", "shipping-settings"],
    queryFn: async (): Promise<ShippingRates> => {
      const { data, error } = await requireSupabase()
        .from("shipping_settings")
        .select("alexandria_fee, outside_fee")
        .eq("id", "default")
        .maybeSingle();
      if (error || !data) return DEFAULT_SHIPPING_RATES;
      return {
        alexandria: Number(data.alexandria_fee) || DEFAULT_SHIPPING_RATES.alexandria,
        outside: Number(data.outside_fee) || DEFAULT_SHIPPING_RATES.outside,
      };
    },
    staleTime: 60_000,
  });
}
