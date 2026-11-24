import { createContext, useContext, useState, type ReactNode } from "react";
import { SAMPLE_ACCOUNTS, SAMPLE_CATALOG, SAMPLE_MUTATIONS, SAMPLE_ORDERS, SAMPLE_RETURNS, SAMPLE_SHOPS, type Account, type CatalogItem, type Mutation, type Order, type ReturnCase, type Shop, type Withdrawal } from "./prototype-data";
import { getProduct } from "./store-data";
import { goLiveMissing, nextReturnStatus, nextStatus, sellerEarning, refundSellerDeduction, type OrderAction, type ReturnAction } from "./workflow";

export const orderSubtotal = (o: Order) => (getProduct(o.productId)?.price ?? 0) * o.qty;

function usePrototypeState() {
  const [catalog, setCatalog] = useState<CatalogItem[]>(SAMPLE_CATALOG);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [shops, setShops] = useState<Shop[]>(SAMPLE_SHOPS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(SAMPLE_ACCOUNTS);
  const [mutations, setMutations] = useState<Mutation[]>(SAMPLE_MUTATIONS);
  const [returns, setReturns] = useState<ReturnCase[]>(SAMPLE_RETURNS);
  const [buyerBalance, setBuyerBalance] = useState(0);
  const [audit, setAudit] = useState(["Toko Rumah Ceria mengajukan verifikasi usaha", "Pesanan TB-1026 dikirim melalui J&T Express"]);
  const log = (text: string) => setAudit(a => [text, ...a]);
  const mutate = (m: Omit<Mutation, "id">) => setMutations(ms => [{ ...m, id: `MT-${Date.now()}-${ms.length}` }, ...ms]);

  const held = orders.filter(o => !o.credited && ["Dibayar", "Diproses", "Siap diambil", "Dikirim", "Sampai", "Pengembalian"].includes(o.status)).reduce((a, o) => a + sellerEarning(orderSubtotal(o), o.type === "pickup"), 0);
  const locked = withdrawals.filter(w => w.status === "Diajukan").reduce((a, w) => a + w.amount, 0);
  const available = mutations.reduce((a, m) => a + m.amount, 0) - locked;

  const advanceOrder = (id: string, action: OrderAction, extra: Partial<Order> = {}) => {
    const o = orders.find(x => x.id === id); if (!o) return false;
    const to = nextStatus(o.type, o.status, action); if (!to) return false;
    const credit = to === "Selesai" && !o.credited;
    setOrders(os => os.map(x => x.id === id ? { ...x, ...extra, status: to, credited: x.credited || credit } : x));
    if (credit) mutate({ type: "Penjualan", amount: sellerEarning(orderSubtotal(o), o.type === "pickup"), note: `${o.id}${o.type === "pickup" ? " · pickup tanpa fee" : " · subtotal − fee 5%"}` });
    log(`Pesanan ${id}: ${o.status} → ${to}${extra.reason ? ` (${extra.reason})` : ""}${to === "Dibatalkan" && o.status !== "Belum bayar" ? " · refund penuh" : ""}`);
    return true;
  };
  const advanceReturn = (id: string, action: ReturnAction, extra: Partial<ReturnCase> = {}) => {
    const r = returns.find(x => x.id === id); if (!r) return false;
    const to = nextReturnStatus(r.status, action); if (!to) return false;
    const o = orders.find(x => x.id === r.orderId);
    setReturns(rs => rs.map(x => x.id === id ? { ...x, ...extra, status: to } : x));
    if (o && to === "Direfund") {
      const sub = orderSubtotal(o); const refund = extra.refund ?? r.refund ?? sub;
      const keep = sellerEarning(sub, o.type === "pickup") - refundSellerDeduction(refund, sub, o.type === "pickup");
      setBuyerBalance(b => b + refund); log(`Refund ${refund} masuk ke saldo pembeli ${o.buyer}`);
      if (keep > 0) mutate({ type: "Penjualan", amount: keep, note: `${o.id} · sisa setelah refund sebagian` });
      setOrders(os => os.map(x => x.id === o.id ? { ...x, status: refund >= sub ? "Dibatalkan" : "Selesai", credited: true } : x));
    }
    if (o && to === "Ditolak") { setOrders(os => os.map(x => x.id === o.id ? { ...x, status: "Selesai", credited: true } : x)); mutate({ type: "Penjualan", amount: sellerEarning(orderSubtotal(o), o.type === "pickup"), note: `${o.id} · retur ditolak` }); }
    log(`Retur ${id}: ${r.status} → ${to}${extra.decision ? ` (${extra.decision})` : ""}`);
    return true;
  };
  const placeOrder = (o: Omit<Order, "id" | "status" | "tracking" | "paidAt">) => {
    const id = `TB-${1032 + orders.length - SAMPLE_ORDERS.length}`;
    setOrders(os => [{ ...o, id, status: "Belum bayar", tracking: "", paidAt: "" }, ...os]);
    log(`Pesanan ${id} dibuat oleh ${o.buyer} · menunggu pembayaran`);
    return id;
  };
  const goLiveFor = (shop: Shop) => goLiveMissing({ profileComplete: shop.profileComplete, status: shop.status, midtransSubId: shop.midtransSubId, hasVerifiedAccount: accounts.some(a => a.shop === shop.name && a.status === "Terverifikasi"), liveProductsWithPhoto: shop.id === "teknik-jaya" ? catalog.filter(p => p.status === "Live").length : 0 });

  return { catalog, setCatalog, orders, setOrders, shops, setShops, withdrawals, setWithdrawals, accounts, setAccounts, mutations, mutate, returns, setReturns, audit, log, available, held, locked, advanceOrder, advanceReturn, goLiveFor, placeOrder, buyerBalance };
}
const PrototypeContext = createContext<ReturnType<typeof usePrototypeState> | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  return <PrototypeContext.Provider value={usePrototypeState()}>{children}</PrototypeContext.Provider>;
}
export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) throw new Error("PrototypeProvider is required");
  return context;
}
