import { createFileRoute } from "@tanstack/react-router";
import { SellerPage } from "@/components/portal/seller";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/seller/")({ head: () => pageMeta("Seller Center", "Ringkasan penjualan, produk, pesanan, dan saldo toko di Tabyte."), component: () => <SellerPage /> });
