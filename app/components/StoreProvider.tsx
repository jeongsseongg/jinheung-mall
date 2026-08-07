"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type StoreContextValue = {
  cart: Record<string, number>;
  favorites: string[];
  cartCount: number;
  addToCart: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleFavorite: (id: string) => void;
  notice: string;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>(["peony-blush", "eucalyptus-gray"]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedCart = window.localStorage.getItem("jinheung-cart");
    const savedFavorites = window.localStorage.getItem("jinheung-favorites");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jinheung-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("jinheung-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const addToCart = (id: string, quantity = 1) => {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + quantity }));
    showNotice("장바구니에 담았습니다.");
  };

  const setQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((current) => ({ ...current, [id]: quantity }));
  };

  const removeFromCart = (id: string) => {
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      showNotice(current.includes(id) ? "자주 주문에서 삭제했습니다." : "자주 주문에 등록했습니다.");
      return next;
    });
  };

  const value = useMemo(
    () => ({
      cart,
      favorites,
      cartCount: Object.values(cart).reduce((sum, quantity) => sum + quantity, 0),
      addToCart,
      setQuantity,
      removeFromCart,
      toggleFavorite,
      notice,
    }),
    [cart, favorites, notice],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className={`toast ${notice ? "toast-visible" : ""}`} role="status" aria-live="polite">
        {notice}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
