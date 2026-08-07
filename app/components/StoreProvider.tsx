"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Product } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
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
const firstColor = (catalog: Product[], id: string) => catalog.find((product) => product.id === id)?.color.split(",")[0]?.trim() || "";
const skuForId = (catalog: Product[], id: string) => catalog.find((item) => item.id === id)?.sku || "";
const makeFavoritePayload = (catalog: Product[], ids: string[]) => [...new Set(ids.map((id) => skuForId(catalog, id)).filter(Boolean))].sort();

const readRecord = (key: string) => {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).flatMap(([id, quantity]) => {
      const parsed = Number(quantity);
      return id && Number.isInteger(parsed) && parsed > 0 && parsed <= 999 ? [[id, parsed]] : [];
    }));
  }
  catch { return {}; }
};

const readColorRecord = (key: string) => {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length <= 100));
  }
  catch { return {}; }
};

const readFavorites = (key: string, fallbackKey?: string) => {
  try {
    const saved = window.localStorage.getItem(key)
      || (fallbackKey ? window.localStorage.getItem(fallbackKey) : null)
      || "[]";
    const value: unknown = JSON.parse(saved);
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.length <= 200))].slice(0, 200) : [];
  } catch {
    return [];
  }
};

const makePayload = (catalog: Product[], cart: Record<string, number>, colors: Record<string, string>): CartPayloadItem[] => Object.entries(cart)
  .map(([id, quantity]) => {
    const product = catalog.find((item) => item.id === id);
    return product?.sku ? { sku: product.sku, quantity, color: colors[id] || firstColor(catalog, id) } : null;
  })
  .filter((item): item is CartPayloadItem => Boolean(item))
  .sort((a, b) => a.sku.localeCompare(b.sku));

const recordsFromServer = (catalog: Product[], items: StoredCartItem[]) => {
  const productBySku = new Map(catalog.flatMap((product) => product.sku ? [[product.sku, product] as const] : []));
  const cart: Record<string, number> = {};
  const colors: Record<string, string> = {};
  for (const item of items) {
    const product = productBySku.get(item.sku);
    if (!product) continue;
    cart[product.id] = item.quantity;
    colors[product.id] = item.color || firstColor(catalog, product.id);
  }
  return { cart, colors };
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { products: catalog, loading: productsLoading } = useProducts();
  const userId = user?.id ?? null;
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartColors, setCartColors] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [cartSyncing, setCartSyncing] = useState(false);
  const [storeOwnerId, setStoreOwnerId] = useState<string | null>(null);
  const activeUserId = useRef<string | null>(null);
  const lastSyncedPayload = useRef("");
  const lastSyncedFavorites = useRef("");

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  useEffect(() => {
    let active = true;
    const guestCart = readRecord("jinheung-cart-guest");
    const legacyCart = Object.keys(guestCart).length ? guestCart : readRecord("jinheung-cart");
    const guestColors = readColorRecord("jinheung-cart-colors-guest");
    const guestFavorites = readFavorites("jinheung-favorites-guest", "jinheung-favorites");
    window.queueMicrotask(() => {
      if (!active) return;
      setCart(legacyCart);
      setCartColors(guestColors);
      setFavorites(guestFavorites);
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading || productsLoading) return;
    let active = true;

    if (!userId) {
      activeUserId.current = null;
      lastSyncedPayload.current = "";
      lastSyncedFavorites.current = "";
      const storedGuestCart = readRecord("jinheung-cart-guest");
      const guestCart = Object.keys(storedGuestCart).length ? storedGuestCart : readRecord("jinheung-cart");
      const guestColors = readColorRecord("jinheung-cart-colors-guest");
      const guestFavorites = readFavorites("jinheung-favorites-guest", "jinheung-favorites");
      window.queueMicrotask(() => {
        if (!active) return;
        setCart(guestCart);
        setCartColors(guestColors);
        setFavorites(guestFavorites);
        setStoreOwnerId(null);
        setCartReady(false);
        setFavoritesReady(false);
      });
      return () => { active = false; };
    }

    const storedGuestCart = readRecord("jinheung-cart-guest");
    const guestCart = Object.keys(storedGuestCart).length ? storedGuestCart : readRecord("jinheung-cart");
    const guestColors = readColorRecord("jinheung-cart-colors-guest");
    const guestFavoriteIds = readFavorites("jinheung-favorites-guest", "jinheung-favorites");
    const guestPayload = makePayload(catalog, guestCart, guestColors);
    const guestFavorites = makeFavoritePayload(catalog, guestFavoriteIds);
    window.queueMicrotask(() => {
      if (!active) return;
      setCartSyncing(true);
      setCartReady(false);
      setFavoritesReady(false);
    });
    Promise.all([
      getSupabaseBrowserClient().rpc("merge_user_cart", { p_items: guestPayload }),
      getSupabaseBrowserClient().rpc("merge_user_favorites", { p_skus: guestFavorites }),
    ]).then(([cartResult, favoriteResult]) => {
      if (!active) return;
      if (cartResult.error || favoriteResult.error) {
        setCart(guestCart);
        setCartColors(guestColors);
        setFavorites(guestFavoriteIds);
        activeUserId.current = userId;
        setStoreOwnerId(userId);
        setCartSyncing(false);
        showNotice("계정 저장 정보를 불러오지 못했습니다.");
        return;
      }
      const next = recordsFromServer(catalog, (cartResult.data || []) as StoredCartItem[]);
      const productIdBySku = new Map(catalog.flatMap((product) => product.sku ? [[product.sku, product.id] as const] : []));
      const nextFavorites = ((favoriteResult.data || []) as string[])
        .map((sku) => productIdBySku.get(sku))
        .filter((id): id is string => Boolean(id));
      setCart(next.cart);
      setCartColors(next.colors);
      setFavorites(nextFavorites);
      window.localStorage.removeItem("jinheung-cart");
      window.localStorage.removeItem("jinheung-cart-guest");
      window.localStorage.removeItem("jinheung-cart-colors-guest");
      window.localStorage.removeItem("jinheung-favorites");
      window.localStorage.removeItem("jinheung-favorites-guest");
      activeUserId.current = userId;
      setStoreOwnerId(userId);
      lastSyncedPayload.current = JSON.stringify(makePayload(catalog, next.cart, next.colors));
      lastSyncedFavorites.current = JSON.stringify(makeFavoritePayload(catalog, nextFavorites));
      setCartReady(true);
      setFavoritesReady(true);
      setCartSyncing(false);
    });

    return () => { active = false; };
  }, [authLoading, catalog, hydrated, productsLoading, userId]);

  useEffect(() => {
    if (!hydrated || authLoading || user) return;
    window.localStorage.setItem("jinheung-cart-guest", JSON.stringify(cart));
    window.localStorage.setItem("jinheung-cart-colors-guest", JSON.stringify(cartColors));
  }, [authLoading, cart, cartColors, hydrated, user]);

  useEffect(() => {
    if (!hydrated || authLoading || user) return;
    window.localStorage.setItem("jinheung-favorites-guest", JSON.stringify(favorites));
  }, [authLoading, favorites, hydrated, user]);

  useEffect(() => {
    if (!user || !cartReady || activeUserId.current !== user.id) return;
    const payload = makePayload(catalog, cart, cartColors);
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
  }, [cart, cartColors, cartReady, catalog, user]);

  useEffect(() => {
    if (!user || !favoritesReady || activeUserId.current !== user.id) return;
    const payload = makeFavoritePayload(catalog, favorites);
    const serialized = JSON.stringify(payload);
    if (serialized === lastSyncedFavorites.current) return;
    const timer = window.setTimeout(() => {
      getSupabaseBrowserClient().rpc("sync_user_favorites", { p_skus: payload }).then(({ error }) => {
        if (error) { showNotice("자주 주문 저장에 실패했습니다."); return; }
        lastSyncedFavorites.current = serialized;
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [catalog, favorites, favoritesReady, user]);

  const addToCart = (id: string, quantity = 1, color?: string) => {
    if (!hydrated || productsLoading || storeOwnerId !== userId) { showNotice("장바구니 정보를 불러오는 중입니다."); return; }
    const safeQuantity = Number.isFinite(quantity) ? Math.min(999, Math.max(1, Math.trunc(quantity))) : 1;
    setCart((current) => ({ ...current, [id]: Math.min(999, (current[id] ?? 0) + safeQuantity) }));
    setCartColors((current) => ({ ...current, [id]: color || current[id] || firstColor(catalog, id) }));
    showNotice(user ? "장바구니에 담고 계정에 저장합니다." : "장바구니에 담았습니다.");
  };

  const setQuantity = (id: string, quantity: number) => {
    if (!hydrated || storeOwnerId !== userId) return;
    if (!Number.isFinite(quantity)) return;
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((current) => ({ ...current, [id]: Math.min(999, Math.trunc(quantity)) }));
  };

  const setCartColor = (id: string, color: string) => {
    if (!hydrated || storeOwnerId !== userId) return;
    setCartColors((current) => ({ ...current, [id]: color }));
  };

  const removeFromCart = (id: string) => {
    if (!hydrated || storeOwnerId !== userId) return;
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
    if (!hydrated || storeOwnerId !== userId) return;
    setCart({});
    setCartColors({});
    lastSyncedPayload.current = "[]";
    window.localStorage.removeItem("jinheung-cart-guest");
    window.localStorage.removeItem("jinheung-cart-colors-guest");
  };

  const toggleFavorite = (id: string) => {
    if (!hydrated || productsLoading || storeOwnerId !== userId) { showNotice("계정 정보를 불러오는 중입니다."); return; }
    setFavorites((current) => {
      if (!current.includes(id) && current.length >= 200) {
        showNotice("자주 주문 상품은 최대 200개까지 저장할 수 있습니다.");
        return current;
      }
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      showNotice(current.includes(id) ? "자주 주문에서 삭제했습니다." : "자주 주문에 등록했습니다.");
      return next;
    });
  };

  const storeReadyForSession = hydrated && !productsLoading && storeOwnerId === userId;
  const visibleCart = storeReadyForSession ? cart : {};
  const visibleCartColors = storeReadyForSession ? cartColors : {};
  const visibleFavorites = storeReadyForSession ? favorites : [];
  const value = {
    cart: visibleCart,
    cartColors: visibleCartColors,
    favorites: visibleFavorites,
    cartCount: Object.values(visibleCart).reduce((sum, quantity) => sum + quantity, 0),
    cartSyncing: cartSyncing || !storeReadyForSession,
    addToCart,
    setQuantity,
    setCartColor,
    removeFromCart,
    clearCart,
    toggleFavorite,
    notice,
  };

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
