import { PRODUCTS, type Product } from "./store-data";

export type CatalogItem = Product & { status: "Live" | "Draft" };
export type Order = { id: string; buyer: string; productId: string; qty: number; status: "Perlu diproses" | "Dikirim" | "Selesai"; courier: string; tracking: string };
export type Shop = { id: string; name: string; owner: string; email: string; city: string; status: "Aktif" | "Menunggu review" | "Perlu perbaikan"; description: string };
export type Request = { id: string; shop: string; amount: number; status: "Menunggu review" | "Disetujui" | "Perlu perbaikan" };
export const SAMPLE_ORDERS: Order[] = [
  { id: "TB-1028", buyer: "Rina Putri", productId: "bor-500w", qty: 1, status: "Perlu diproses", courier: "JNE Reguler", tracking: "" },
  { id: "TB-1027", buyer: "Andi Pratama", productId: "toolbox", qty: 2, status: "Perlu diproses", courier: "SiCepat BEST", tracking: "" },
  { id: "TB-1026", buyer: "Dewi Lestari", productId: "headset", qty: 1, status: "Dikirim", courier: "J&T Express", tracking: "JT0001026" },
  { id: "TB-1025", buyer: "Budi Santoso", productId: "gerinda-4", qty: 1, status: "Selesai", courier: "JNE Reguler", tracking: "JN0001025" },
];
export const SAMPLE_SHOPS: Shop[] = [
  { id: "teknik-jaya", name: "Teknik Jaya", owner: "Adi Wijaya", email: "adi@example.com", city: "Surabaya", status: "Aktif", description: "Perkakas andalan untuk rumah dan tempat kerja." },
  { id: "rumah-ceria", name: "Rumah Ceria", owner: "Nadia Putri", email: "nadia@example.com", city: "Bandung", status: "Menunggu review", description: "Pilihan kebutuhan rumah sehari-hari." },
  { id: "audio-kita", name: "Audio Kita", owner: "Reza Pratama", email: "reza@example.com", city: "Jakarta Selatan", status: "Menunggu review", description: "Audio dan aksesori elektronik." },
];
export const SAMPLE_CATALOG: CatalogItem[] = PRODUCTS.map(p => ({ ...p, status: "Live" }));
export const calculateCartQuote = (itemsTotal: number) => ({ itemsTotal, shipping: null, grandTotal: null });
export const sellerSections = [
  { id: "", label: "Ringkasan" }, { id: "products", label: "Produk" }, { id: "orders", label: "Pesanan" },
  { id: "profile", label: "Profil toko" }, { id: "business", label: "Info usaha" }, { id: "finance", label: "Saldo & rekening" },
];
export const adminSections = [
  { id: "", label: "Ringkasan" }, { id: "stores", label: "Toko" }, { id: "verif", label: "Verifikasi usaha" },
  { id: "withdrawals", label: "Penarikan" }, { id: "accounts", label: "Rekening penjual" },
  { id: "disputes", label: "Sengketa retur" }, { id: "audit", label: "Catatan aktivitas" },
];