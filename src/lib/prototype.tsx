import { createContext, useContext, useState, type ReactNode } from "react";
import { SAMPLE_CATALOG, SAMPLE_ORDERS, SAMPLE_SHOPS, type CatalogItem, type Order, type Shop, type Request } from "./prototype-data";

function usePrototypeState() {
  const [catalog, setCatalog] = useState<CatalogItem[]>(SAMPLE_CATALOG);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [shops, setShops] = useState<Shop[]>(SAMPLE_SHOPS);
  const [withdrawals, setWithdrawals] = useState<Request[]>([{ id: "WD-1001", shop: "Teknik Jaya", amount: 365000, status: "Menunggu review" }]);
  const [accounts, setAccounts] = useState([{ id: "AC-1001", shop: "Teknik Jaya", bank: "BCA", name: "Adi Wijaya", number: "•••• 4821", status: "Menunggu review" }]);
  const [audit, setAudit] = useState(["Toko Rumah Ceria mengajukan verifikasi usaha", "Pesanan TB-1026 dikirim melalui J&T Express"]);
  const [dispute, setDispute] = useState("Menunggu tinjauan");
  const log = (text: string) => setAudit(a => [text, ...a]);
  return { catalog, setCatalog, orders, setOrders, shops, setShops, withdrawals, setWithdrawals, accounts, setAccounts, audit, log, dispute, setDispute };
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