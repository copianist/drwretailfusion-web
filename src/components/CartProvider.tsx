"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { productId: string; size: string; quantity: number };
type Ctx = {
  items: CartItem[];
  add: (i: CartItem) => void;
  update: (productId: string, size: string, quantity: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "drw_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, loaded]);

  const same = (a: CartItem, id: string, size: string) => a.productId === id && a.size === size;
  const value: Ctx = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    add: (i) =>
      setItems((cur) =>
        cur.some((c) => same(c, i.productId, i.size))
          ? cur.map((c) => (same(c, i.productId, i.size) ? { ...c, quantity: Math.min(5, c.quantity + i.quantity) } : c))
          : [...cur, i]
      ),
    update: (id, size, quantity) =>
      setItems((cur) => cur.map((c) => (same(c, id, size) ? { ...c, quantity: Math.max(1, Math.min(5, quantity)) } : c))),
    remove: (id, size) => setItems((cur) => cur.filter((c) => !same(c, id, size))),
    clear: () => setItems([]),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
