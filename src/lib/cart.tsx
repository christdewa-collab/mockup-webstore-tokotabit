import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./store-data";

type Line = { id: string; variant: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[]; count: number; total: number;
  add: (id: string, variant: string, qty?: number) => void;
  setQty: (id: string, variant: string, qty: number) => void;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const value = useMemo<Ctx>(() => {
    const full = lines.map((l) => ({ ...l, product: getProduct(l.id)! })).filter((l) => l.product);
    return {
      lines: full,
      count: full.reduce((a, l) => a + l.qty, 0),
      total: full.reduce((a, l) => a + l.qty * l.product.price, 0),
      add: (id, variant, qty = 1) => setLines((ls) => {
        const f = ls.find((l) => l.id === id && l.variant === variant);
        return f ? ls.map((l) => (l === f ? { ...l, qty: l.qty + qty } : l)) : [...ls, { id, variant, qty }];
      }),
      setQty: (id, variant, qty) => setLines((ls) => qty <= 0 ? ls.filter((l) => !(l.id === id && l.variant === variant)) : ls.map((l) => (l.id === id && l.variant === variant ? { ...l, qty } : l))),
    };
  }, [lines]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};
