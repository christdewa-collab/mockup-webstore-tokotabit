import { describe, expect, it } from "vitest";
import { canDeleteAccount, goLiveMissing, missingDocs, nextReturnStatus, nextStatus, sellerEarning, validateWithdrawal, canAddAccount, SERVICE_FEE } from "@/lib/workflow";

const verified = { id: "a", status: "Terverifikasi" as const, primary: true };
describe("Workflow Tabyte rules", () => {
  it("blocks verification submission when required documents are missing", () => {
    expect(missingDocs("Perorangan", [])).toEqual(["KTP pemilik", "NPWP"]);
    expect(missingDocs("Perorangan", ["KTP pemilik", "NPWP"])).toEqual([]);
  });
  it("keeps a verified shop offline until Midtrans Sub ID, account and a live product exist", () => {
    expect(goLiveMissing({ profileComplete: true, status: "Terverifikasi", hasVerifiedAccount: false, midtransSubId: "", liveProductsWithPhoto: 0 })).toHaveLength(3);
    expect(goLiveMissing({ profileComplete: true, status: "Terverifikasi", hasVerifiedAccount: true, midtransSubId: "SUB-1", liveProductsWithPhoto: 1 })).toEqual([]);
  });
  it("rejects a Rp10.000 withdrawal (minimum Rp50.000)", () => {
    expect(validateWithdrawal({ amount: 10000, available: 365000, account: verified, hasRunning: false })).toMatch(/Rp50.000/);
    expect(validateWithdrawal({ amount: 50000, available: 365000, account: verified, hasRunning: false })).toBeNull();
  });
  it("allows only one running withdrawal and only verified accounts", () => {
    expect(validateWithdrawal({ amount: 60000, available: 365000, account: verified, hasRunning: true })).not.toBeNull();
    expect(validateWithdrawal({ amount: 60000, available: 365000, account: { ...verified, status: "Menunggu verifikasi" }, hasRunning: false })).not.toBeNull();
  });
  it("seller earns subtotal minus 5%, pickup has no platform fee, buyer pays Rp1.000 service fee", () => {
    expect(sellerEarning(100000, false)).toBe(95000);
    expect(sellerEarning(100000, true)).toBe(100000);
    expect(SERVICE_FEE).toBe(1000);
  });
  it("cannot delete the only verified primary account; max 3 accounts", () => {
    expect(canDeleteAccount(verified, [verified], false)).not.toBeNull();
    expect(canDeleteAccount(verified, [verified, { id: "b", status: "Terverifikasi", primary: false }], false)).toBeNull();
    expect(canAddAccount([verified, verified, verified])).toBe(false);
  });
  it("orders follow paid → accepted → shipped → arrived → done; unpaid past deadline cancels", () => {
    expect(nextStatus("online", "Dibayar", "kirim")).toBeNull();
    expect(nextStatus("online", "Dibayar", "terima")).toBe("Diproses");
    expect(nextStatus("online", "Sampai", "selesai")).toBe("Selesai");
    expect(nextStatus("online", "Belum bayar", "lewat-batas-bayar")).toBe("Dibatalkan");
    expect(nextStatus("pickup", "Siap diambil", "serahkan")).toBe("Selesai");
  });
  it("rejected or unanswered return escalates to admin dispute", () => {
    expect(nextReturnStatus("Diajukan", "tolak")).toBe("Sengketa");
    expect(nextReturnStatus("Sengketa", "putuskan-refund")).toBe("Direfund");
  });
});

import { checkoutTotal, paymentFee, validateCheckout, validateReturnRequest } from "@/lib/workflow";
describe("Checkout & retur", () => {
  it("total = subtotal + ongkir + Rp1.000 + biaya pembayaran", () => {
    expect(checkoutTotal({ subtotal: 100000, shipping: 20000, method: "va-bca" }).total).toBe(125000);
    expect(paymentFee("qris", 121000)).toBe(847);
  });
  it("kurir needs address and courier; pickup does not", () => {
    expect(validateCheckout({ delivery: "kurir", name: "A", phone: "081234567890", address: "", courier: null })).not.toBeNull();
    expect(validateCheckout({ delivery: "pickup", name: "A", phone: "081234567890", address: "", courier: null })).toBeNull();
  });
  it("return requires uncut unboxing video", () => {
    expect(validateReturnRequest({ reason: "Rusak", videoName: "foto.jpg", uncutConfirmed: true })).not.toBeNull();
    expect(validateReturnRequest({ reason: "Rusak", videoName: "unboxing.mp4", uncutConfirmed: false })).not.toBeNull();
    expect(validateReturnRequest({ reason: "Rusak", videoName: "unboxing.mp4", uncutConfirmed: true })).toBeNull();
  });
});
