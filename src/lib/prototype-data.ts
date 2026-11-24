import { PRODUCTS, type Product } from "./store-data";
import type { AccountStatus, BusinessType, OrderStatus, OrderType, ReturnStatus, ShopStatus } from "./workflow";
import { SERVICE_FEE, type ReturnShippingPayer } from "./workflow";

export type CatalogItem = Product & { status: "Live" | "Draft" };
export type Order = { id: string; buyer: string; productId: string; qty: number; type: OrderType; status: OrderStatus; courier: string; tracking: string; paidAt: string; payDeadline?: string; poDays?: number; pickupCode?: string; reason?: string | undefined; credited?: boolean };
export type Shop = { id: string; name: string; owner: string; email: string; city: string; status: ShopStatus; description: string; businessType: BusinessType; legalName: string; npwp: string; documents: string[]; profileComplete: boolean; midtransSubId: string; reason?: string | undefined; verifiedBy?: string | undefined };
export type Withdrawal = { id: string; shop: string; amount: number; accountId: string; status: "Diajukan" | "Dibayar" | "Ditolak"; ref?: string; reason?: string | undefined };
export type Account = { id: string; shop: string; bank: string; name: string; number: string; status: AccountStatus; primary: boolean; nameMismatch: boolean; proof: string; reason?: string | undefined };
export type Mutation = { id: string; type: "Penjualan" | "Penarikan" | "Penarikan dikembalikan" | "Refund"; amount: number; note: string };
export type ReturnCase = { id: string; orderId: string; reason: string; evidence: string; status: ReturnStatus; decision?: string; refund?: number; returnShippingPayer?: ReturnShippingPayer; uncut?: boolean };

export const SAMPLE_ORDERS: Order[] = [
  { id: "TB-1031", buyer: "Sari Wulandari", productId: "lampu", qty: 2, type: "online", status: "Belum bayar", courier: "JNE Reguler", tracking: "", paidAt: "", payDeadline: "2026-11-25" },
  { id: "TB-1030", buyer: "Yoga Saputra", productId: "las-200a", qty: 1, type: "preorder", status: "Diproses", courier: "SiCepat BEST", tracking: "", paidAt: "2026-11-20", poDays: 7 },
  { id: "TB-1029", buyer: "Rina Putri", productId: "bor-500w", qty: 1, type: "online", status: "Dibayar", courier: "JNE Reguler", tracking: "", paidAt: "2026-11-24" },
  { id: "TB-1028", buyer: "Andi Pratama", productId: "toolbox", qty: 2, type: "pickup", status: "Dibayar", courier: "Ambil di toko", tracking: "", paidAt: "2026-11-24" },
  { id: "TB-1027", buyer: "Lina Marlina", productId: "obeng-set", qty: 1, type: "online", status: "Diproses", courier: "SiCepat BEST", tracking: "", paidAt: "2026-11-23" },
  { id: "TB-1026", buyer: "Dewi Lestari", productId: "headset", qty: 1, type: "online", status: "Dikirim", courier: "J&T Express", tracking: "JT0001026", paidAt: "2026-11-21" },
  { id: "TB-1025", buyer: "Budi Santoso", productId: "gerinda-4", qty: 1, type: "online", status: "Sampai", courier: "JNE Reguler", tracking: "JN0001025", paidAt: "2026-11-19" },
  { id: "TB-1023", buyer: "Fajar Nugroho", productId: "kipas", qty: 1, type: "online", status: "Pengembalian", courier: "JNE Reguler", tracking: "JN0001023", paidAt: "2026-11-15" },
  { id: "TB-1022", buyer: "Maya Sari", productId: "helm", qty: 1, type: "online", status: "Pengembalian", courier: "J&T Express", tracking: "JT0001022", paidAt: "2026-11-16" },
];
export const SAMPLE_RETURNS: ReturnCase[] = [
  { id: "RT-1001", orderId: "TB-1023", reason: "Tidak sesuai deskripsi", evidence: "unboxing-kipas.mp4", status: "Sengketa", uncut: true },
  { id: "RT-1002", orderId: "TB-1022", reason: "Rusak/cacat", evidence: "unboxing-helm.mp4", status: "Diajukan", uncut: true },
];
export const SAMPLE_SHOPS: Shop[] = [
  { id: "teknik-jaya", name: "Teknik Jaya", owner: "Adi Wijaya", email: "adi@example.com", city: "Surabaya", status: "Aktif", description: "Perkakas andalan untuk rumah dan tempat kerja.", businessType: "Perorangan", legalName: "Adi Wijaya", npwp: "091234567801000", documents: ["KTP pemilik", "NPWP"], profileComplete: true, midtransSubId: "SUB-TJ-001", verifiedBy: "Admin Tabyte" },
  { id: "rumah-ceria", name: "Rumah Ceria", owner: "Nadia Putri", email: "nadia@example.com", city: "Bandung", status: "Menunggu verifikasi", description: "Pilihan kebutuhan rumah sehari-hari.", businessType: "Perusahaan", legalName: "PT Rumah Ceria Abadi", npwp: "021234567802000", documents: ["Akta pendirian", "NIB", "NPWP badan"], profileComplete: true, midtransSubId: "" },
  { id: "audio-kita", name: "Audio Kita", owner: "Reza Pratama", email: "reza@example.com", city: "Jakarta Selatan", status: "Menyiapkan toko", description: "Audio dan aksesori elektronik.", businessType: "Perorangan", legalName: "Reza Pratama", npwp: "", documents: ["KTP pemilik"], profileComplete: false, midtransSubId: "" },
];
export const SAMPLE_ACCOUNTS: Account[] = [
  { id: "AC-1001", shop: "Teknik Jaya", bank: "BCA", name: "Adi Wijaya", number: "•••• 4821", status: "Terverifikasi", primary: true, nameMismatch: false, proof: "buku-tabungan-bca.jpg" },
  { id: "AC-1002", shop: "Teknik Jaya", bank: "Mandiri", name: "Adi W.", number: "•••• 7730", status: "Menunggu verifikasi", primary: false, nameMismatch: true, proof: "mbanking-mandiri.png" },
];
export const SAMPLE_MUTATIONS: Mutation[] = [
  { id: "MT-1", type: "Penjualan", amount: 365000, note: "Pesanan selesai bulan ini" },
];
export const SAMPLE_CATALOG: CatalogItem[] = PRODUCTS.map(p => ({ ...p, status: "Live" }));
/** Shipping is quoted by courier API from district + weight; never assumed. Buyer pays a Rp1.000 service fee. */
export const calculateCartQuote = (itemsTotal: number) => ({ itemsTotal, serviceFee: SERVICE_FEE, shipping: null, grandTotal: null });
export const sellerSections = [
  { id: "", label: "Ringkasan" }, { id: "products", label: "Produk" }, { id: "orders", label: "Pesanan" },
  { id: "profile", label: "Profil toko" }, { id: "business", label: "Info usaha" }, { id: "finance", label: "Saldo & rekening" },
];
export const adminSections = [
  { id: "", label: "Ringkasan" }, { id: "stores", label: "Toko" }, { id: "verif", label: "Verifikasi usaha" },
  { id: "withdrawals", label: "Penarikan" }, { id: "accounts", label: "Rekening penjual" },
  { id: "disputes", label: "Sengketa retur" }, { id: "audit", label: "Catatan aktivitas" },
];
/** Prototype courier quotes standing in for the shipping API (district + weight). */
export const COURIER_QUOTES = [
  { id: "jne-reg", label: "JNE Reguler", eta: "2–3 hari", perKg: 18000 },
  { id: "jnt-ez", label: "J&T Express EZ", eta: "2–3 hari", perKg: 17000 },
  { id: "sicepat-best", label: "SiCepat BEST", eta: "1 hari", perKg: 32000 },
];
export const DEFAULT_ITEM_WEIGHT_KG = 1;
