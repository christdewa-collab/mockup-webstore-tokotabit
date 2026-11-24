/** Business rules from "Workflow Tabyte" (QA 28 Okt – 2 Nov 2026). Pure functions only. */
export const PLATFORM_FEE_RATE = 0.05;
export const SERVICE_FEE = 1000;
export const MIN_WITHDRAWAL = 50000;
export const MAX_ACCOUNTS = 3;
export const AUTO_COMPLETE_DAYS = 3;
export const SELLER_PROCESS_DAYS = 2;
export const PICKUP_WINDOW_DAYS = 3;
export const RETURN_WINDOW_DAYS = 3;

export type BusinessType = "Perorangan" | "Perusahaan";
export const REQUIRED_DOCS: Record<BusinessType, string[]> = {
  Perorangan: ["KTP pemilik", "NPWP"],
  Perusahaan: ["Akta pendirian", "NIB", "NPWP badan"],
};
export const missingDocs = (type: BusinessType, uploaded: string[]) => REQUIRED_DOCS[type].filter(d => !uploaded.includes(d));
export const maskNpwp = (npwp: string) => npwp.length <= 4 ? npwp : `${"•".repeat(Math.max(0, npwp.length - 4))}${npwp.slice(-4)}`;

export type ShopStatus = "Undangan terkirim" | "Menyiapkan toko" | "Menunggu verifikasi" | "Terverifikasi" | "Aktif" | "Perlu revisi" | "Ditangguhkan";
export type GoLiveInput = { profileComplete: boolean; status: ShopStatus; hasVerifiedAccount: boolean; midtransSubId: string; liveProductsWithPhoto: number };
export function goLiveMissing(s: GoLiveInput): string[] {
  const out: string[] = [];
  if (!s.profileComplete) out.push("Profil toko lengkap");
  if (s.status !== "Terverifikasi" && s.status !== "Aktif") out.push("Usaha terverifikasi");
  if (!s.hasVerifiedAccount) out.push("Rekening terverifikasi");
  if (!s.midtransSubId.trim()) out.push("Midtrans Sub ID terisi");
  if (s.liveProductsWithPhoto < 1) out.push("Minimal 1 produk Live berfoto");
  return out;
}

export const sellerEarning = (subtotal: number, pickup: boolean) => pickup ? subtotal : Math.round(subtotal * (1 - PLATFORM_FEE_RATE));

export type AccountStatus = "Menunggu verifikasi" | "Terverifikasi" | "Ditolak";
export type AccountLike = { id: string; status: AccountStatus; primary: boolean };
export function validateWithdrawal(i: { amount: number; available: number; account?: AccountLike | undefined; hasRunning: boolean }): string | null {
  if (i.hasRunning) return "Masih ada penarikan yang sedang diproses.";
  if (!Number.isFinite(i.amount) || i.amount < MIN_WITHDRAWAL) return "Minimal penarikan Rp50.000.";
  if (i.amount > i.available) return "Jumlah melebihi saldo tersedia.";
  if (!i.account || i.account.status !== "Terverifikasi") return "Pilih rekening yang sudah terverifikasi.";
  return null;
}
export const canAddAccount = (accounts: AccountLike[]) => accounts.length < MAX_ACCOUNTS;
export function canDeleteAccount(target: AccountLike, accounts: AccountLike[], hasRunning: boolean): string | null {
  if (!target.primary) return null;
  if (hasRunning) return "Tidak bisa menghapus rekening utama saat ada penarikan berjalan.";
  if (!accounts.some(a => a.id !== target.id && a.status === "Terverifikasi")) return "Tambahkan rekening terverifikasi lain sebelum menghapus rekening utama.";
  return null;
}
export const namesMatch = (owner: string, legal: string) => owner.trim().toLowerCase() === legal.trim().toLowerCase();

export type OrderType = "online" | "pickup" | "preorder";
export type OrderStatus = "Belum bayar" | "Dibayar" | "Diproses" | "Siap diambil" | "Dikirim" | "Sampai" | "Selesai" | "Dibatalkan" | "Pengembalian";
export type OrderAction = "bayar" | "lewat-batas-bayar" | "terima" | "tolak" | "siap-diambil" | "serahkan" | "kirim" | "tandai-sampai" | "selesai" | "ajukan-retur";
const T: Record<OrderType, Partial<Record<OrderStatus, Partial<Record<OrderAction, OrderStatus>>>>> = {
  online: {
    "Belum bayar": { bayar: "Dibayar", "lewat-batas-bayar": "Dibatalkan" },
    Dibayar: { terima: "Diproses", tolak: "Dibatalkan" },
    Diproses: { kirim: "Dikirim" },
    Dikirim: { "tandai-sampai": "Sampai" },
    Sampai: { selesai: "Selesai", "ajukan-retur": "Pengembalian" },
  },
  pickup: {
    "Belum bayar": { bayar: "Dibayar", "lewat-batas-bayar": "Dibatalkan" },
    Dibayar: { "siap-diambil": "Siap diambil", tolak: "Dibatalkan" },
    "Siap diambil": { serahkan: "Selesai", "lewat-batas-bayar": "Dibatalkan" },
  },
  preorder: {
    "Belum bayar": { bayar: "Dibayar", "lewat-batas-bayar": "Dibatalkan" },
    Dibayar: { terima: "Diproses", tolak: "Dibatalkan" },
    Diproses: { kirim: "Dikirim", tolak: "Dibatalkan" },
    Dikirim: { "tandai-sampai": "Sampai" },
    Sampai: { selesai: "Selesai", "ajukan-retur": "Pengembalian" },
  },
};
export const nextStatus = (type: OrderType, from: OrderStatus, action: OrderAction): OrderStatus | null => T[type][from]?.[action] ?? null;
export const allowedActions = (type: OrderType, from: OrderStatus) => Object.keys(T[type][from] ?? {}) as OrderAction[];
export const actionNeedsReason = (a: OrderAction) => a === "tolak";
export const actionNeedsTracking = (a: OrderAction) => a === "kirim";
export const refundOnCancel = (from: OrderStatus) => from !== "Belum bayar";
export const addDays = (iso: string, days: number) => { const d = new Date(iso); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

export type ReturnStatus = "Diajukan" | "Disetujui" | "Barang dikirim balik" | "Direfund" | "Ditolak" | "Sengketa";
export type ReturnAction = "setujui" | "tolak" | "kirim-balik" | "terima-barang" | "putuskan-refund" | "putuskan-tolak";
const R: Partial<Record<ReturnStatus, Partial<Record<ReturnAction, ReturnStatus>>>> = {
  Diajukan: { setujui: "Disetujui", tolak: "Sengketa" },
  Disetujui: { "kirim-balik": "Barang dikirim balik" },
  "Barang dikirim balik": { "terima-barang": "Direfund" },
  Sengketa: { "putuskan-refund": "Direfund", "putuskan-tolak": "Ditolak" },
};
export const nextReturnStatus = (from: ReturnStatus, a: ReturnAction): ReturnStatus | null => R[from]?.[a] ?? null;
/** Refund reduces seller earning; Tabyte waives its fee on refunded amount. */
export const refundSellerDeduction = (refund: number, subtotal: number, pickup: boolean) => Math.round(sellerEarning(subtotal, pickup) * Math.min(1, refund / subtotal));

/** Checkout: buyer pays subtotal + ongkir + Rp1.000 service fee + payment-gateway fee. Pickup has no ongkir. */
export type PaymentMethod = "qris" | "va-bca" | "va-mandiri" | "va-bni";
export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; rate: number; flat: number }> = {
  qris: { label: "QRIS", rate: 0.007, flat: 0 },
  "va-bca": { label: "Virtual Account BCA", rate: 0, flat: 4000 },
  "va-mandiri": { label: "Virtual Account Mandiri", rate: 0, flat: 4000 },
  "va-bni": { label: "Virtual Account BNI", rate: 0, flat: 4000 },
};
export const paymentFee = (m: PaymentMethod, base: number) => Math.ceil(base * PAYMENT_METHODS[m].rate) + PAYMENT_METHODS[m].flat;
export function checkoutTotal(i: { subtotal: number; shipping: number; method: PaymentMethod }) {
  const base = i.subtotal + i.shipping + SERVICE_FEE;
  const fee = paymentFee(i.method, base);
  return { subtotal: i.subtotal, shipping: i.shipping, serviceFee: SERVICE_FEE, paymentFee: fee, total: base + fee };
}
export function validateCheckout(i: { delivery: "kurir" | "pickup"; name: string; phone: string; address: string; courier: string | null }): string | null {
  if (!i.name.trim() || !/^\d{9,14}$/.test(i.phone.replace(/\D/g, ""))) return "Isi nama dan nomor HP yang valid.";
  if (i.delivery === "kurir" && !i.address.trim()) return "Isi alamat pengiriman.";
  if (i.delivery === "kurir" && !i.courier) return "Pilih kurir.";
  return null;
}

/** Returns require an uncut unboxing video; seller decides who pays return shipping; refunds go to buyer balance. */
export type ReturnShippingPayer = "pembeli" | "seller";
export function validateReturnRequest(i: { reason: string; videoName: string; uncutConfirmed: boolean }): string | null {
  if (!i.reason.trim()) return "Pilih alasan retur.";
  if (!/\.(mp4|mov|webm|mkv)$/i.test(i.videoName)) return "Wajib unggah video unboxing (mp4/mov/webm).";
  if (!i.uncutConfirmed) return "Konfirmasi video unboxing tanpa jeda/potongan.";
  return null;
}
