import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/locale";
import { productTitle } from "@/lib/localized";
import { useToast } from "@/lib/toast";
import { isAvailable, type Product } from "@/lib/types";

const STORAGE_KEY = "nutricare-cart";

export type CartItem = {
  productId: string;
  name: string;
  nameAr?: string;
  nameEn?: string | null;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  brand?: string | null;
  quantity: number;
  maxQty?: number | null;
};

type AddResult = "ok" | "unavailable" | "qty";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  savings: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => AddResult;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { locale, t } = useI18n();
  const toast = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const savings = items.reduce((sum, item) => {
      if (!item.oldPrice || item.oldPrice <= item.price) return sum;
      return sum + (item.oldPrice - item.price) * item.quantity;
    }, 0);

    return {
      items,
      count,
      subtotal,
      savings,
      hydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, quantity = 1) => {
        const hasQtyField = typeof product.stock_qty === "number";
        const availableQty = hasQtyField ? (product.stock_qty ?? 0) : Number.POSITIVE_INFINITY;
        if (!isAvailable(product)) {
          toast.show(t("unavailable"), "error");
          return "unavailable";
        }
        const existing = items.find((item) => item.productId === product.id);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (hasQtyField && nextQty > availableQty) {
          toast.show(t("qtyUnavailable"), "error");
          return "qty";
        }
        const nextItem = {
          name: productTitle(product, locale),
          nameAr: product.name_ar,
          nameEn: product.name_en ?? null,
          price: Number(product.price),
          oldPrice: product.old_price,
          imageUrl: product.image_url,
          brand: product.brand,
          maxQty: hasQtyField ? availableQty : null,
        };
        setItems((current) => {
          const found = current.find((item) => item.productId === product.id);
          if (found) {
            return current.map((item) =>
              item.productId === product.id ? { ...item, ...nextItem, quantity: item.quantity + quantity } : item,
            );
          }
          return [...current, { productId: product.id, quantity, ...nextItem }];
        });
        toast.show(t("added"), "success");
        setIsOpen(true);
        return "ok";
      },
      updateQty: (productId, quantity) => {
        setItems((current) => {
          if (quantity <= 0) return current.filter((item) => item.productId !== productId);
          return current.map((item) => {
            if (item.productId !== productId) return item;
            const cap = typeof item.maxQty === "number" ? item.maxQty : quantity;
            return { ...item, quantity: Math.min(quantity, cap) };
          });
        });
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clear: () => setItems([]),
    };
  }, [items, hydrated, isOpen, locale, t, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
