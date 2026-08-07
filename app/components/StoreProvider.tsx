"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";
import { useAuth } from "./AuthProvider";

type CartPayloadItem = { sku: string; quantity: number; color: string };
type StoredCartItem = { sku: string; quantity: number; color: string | null };

type StoreContextValue = {
  cart: Record<string, number>;
  cartColors: Record<string, string>;
  favorites: string[];
  cartCount: number;
  cartSyncing: boolean;
  addToCart: (id: string, quantity?: number, color?: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setCartColor: (id: string, color: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  notice: string;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const productBySku = new Map(products.map((product) => [product.sku, product]));
const firstColor = (id: string) => products.find((product) => product.id === id)?.color.split(",")[0]?.trim() || "";

const readRecord = (key: string) => {
  try { return JSON.parse(window.localStorage.getItem(key) || "{}") as Record<string, number>; }
  catch { return {}; }
};

const readColorRecord = (key: string) => {
  try { return JSON.parse(window.localStorage.getItem(key) || "{}") as Record<string, string>; }
  catch { return {}; }
};

const makePayload = (cart: Record<string, number>, colors: Record<string, string>): CartPayloadItem[] => Object.entries(cart)
  .map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return product?.sku ? { sku: product.sku, quantity, color: colors[id] || firstColor(id) } : null;
  })
  .filter((item): item is CartPayloadItem => Boolean(item))
  .sort((a, b) => a.sku.localeCompare(b.sku));

const recordsFromServer = (items: StoredCartItem[]) => {
  const cart: Record<string, number> = {};
  const colors: Record<string, string> = {};
  for (const item of items) {
    const product = productBySku.get(item.sku);
    if (!product) continue;
    cart[product.id] = item.quantity;
    colors[product.id] = item.color || firstColor(product.id);
  }
  return { cart, colors };
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartColors, setCartColors] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [cartSyncing, setCartSyncing] = useState(false);
  const activeUserId = useRef<string | null>(null);
  const lastSyncedPayload = useRef("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  useEffect(() => {
    const guestCart = readRecord("jinheung-cart-guest");
    const legacyCart = Object.keys(guestCart).length ? guestCart : readRecord("jinheung-cart");
    setCart(legacyCart);
    setCartColors(readColorRecord("jinheung-cart-colors-guest"));
    try { setFavorites(JSON.parse(window.localStorage.getItem("jinheung-favorites") || "[]")); }
    catch { setFavorites([]); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    let active = true;

    if (!user) {
      activeUserId.current = null;
      lastSyncedPayload.current = "";
      setCart(readRecord("jinheung-cart-guest"));
      setCartColors(readColorRecord("jinheung-cart-colors-guest"));
      setCartReady(false);
      return;
    }

    const guestPayload = makePayload(cart, cartColors);
    setCartSyncing(true);
    setCartReady(false);
    getSupabaseBrowserClient().rpc("merge_user_cart", { p_items: guestPayload }).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setCartSyncing(false);
        showNotice("계정 장바구니를 불러오지 못했습니다.");
        return;
      }
      const next = recordsFromServer((data || []) as StoredCartItem[]);
      setCart(next.cart);
      setCartColors(next.colors);
      window.localStorage.removeItem("jinheung-cart");
      window.localStorage.removeItem("jinheung-cart-guest");
      window.localStorage.removeItem("jinheung-cart-colors-guest");
      activeUserId.current = user.id;
      lastSyncedPayload.current = JSON.stringify(makePayload(next.cart, next.colors));
      setCartReady(true);
      setCartSyncing(false);
    });

    return () => { active = false; };
  }, [authLoading, hydrated, user?.id]);

  useEffect(() => {
    if (!hydrated || authLoading || user) return;
    window.localStorage.setItem("jinheung-cart-guest", JSON.stringify(cart));
    window.localStorage.setItem("jinheung-cart-colors-guest", JSON.stringify(cartColors));
  }, [authLoading, cart, cartColors, hydrated, user]);

  useEffect(() => {
    window.localStorage.setItem("jinheung-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!user || !cartReady || activeUserId.current !== user.id) return;
    const payload = makePayload(cart, cartColors);
    const serialized = JSON.stringify(payload);
    if (serialized === lastSyncedPayload.current) return;

    setCartSyncing(true);
    const timer = window.setTimeout(() => {
      getSupabaseBrowserClient().rpc("sync_user_cart", { p_items: payload }).then(({ error }) => {
        setCartSyncing(false);
        if (error) {
          showNotice("장바구니 저장에 실패했습니다.");
          return;
        }
        lastSyncedPayload.current = serialized;
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [cart, cartColors, cartReady, user]);

  const addToCart = (id: string, quantity = 1, color?: string) => {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + quantity }));
    setCartColors((current) => ({ ...current, [id]: color || current[id] || firstColor(id) }));
    showNotice(user ? "장바구니에 담고 계정에 저장합니다." : "장바구니에 담았습니다.");
  };

  const setQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((current) => ({ ...current, [id]: quantity }));
  };

  const setCartColor = (id: string, color: string) => setCartColors((current) => ({ ...current, [id]: color }));

  const removeFromCart = (id: string) => {
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setCartColors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setCartColors({});
    lastSyncedPayload.current = "[]";
    window.localStorage.removeItem("jinheung-cart-guest");
    window.localStorage.removeItem("jinheung-cart-colors-guest");
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      showNotice(current.includes(id) ? "자주 주문에서 삭제했습니다." : "자주 주문에 등록했습니다.");
      return next;
    });
  };

  const value = useMemo(() => ({
    cart,
    cartColors,
    favorites,
    cartCount: Object.values(cart).reduce((sum, quantity) => sum + quantity, 0),
    cartSyncing,
    addToCart,
    setQuantity,
    setCartColor,
    removeFromCart,
    clearCart,
    toggleFavorite,
    notice,
  }), [cart, cartColors, cartSyncing, favorites, notice]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className={`toast ${notice ? "toast-visible" : ""}`} role="status" aria-live="polite">{notice}</div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
