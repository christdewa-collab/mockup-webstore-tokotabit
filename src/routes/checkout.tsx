import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Store, Truck, QrCode, Landmark, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { usePrototype } from "@/lib/prototype";
import { rp, STORE } from "@/lib/store-data";
import { COURIER_QUOTES, DEFAULT_ITEM_WEIGHT_KG } from "@/lib/prototype-data";
import { PAYMENT_METHODS, PICKUP_WINDOW_DAYS, checkoutTotal, validateCheckout, type PaymentMethod } from "@/lib/workflow";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout & Pembayaran — Tabyte" },
      { name: "description", content: "Pilih pengiriman atau ambil di toko, lalu bayar dengan QRIS atau Virtual Account." },
      { property: "og:title", content: "Checkout & Pembayaran — Tabyte" },
      { property: "og:description", content: "Selesaikan pesananmu di Tabyte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { lines, total, count, setQty } = useCart();
  const { placeOrder } = usePrototype();
  const [delivery, setDelivery] = useState<"kurir" | "pickup">("kurir");
  const [courier, setCourier] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("qris");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState(""); const [done, setDone] = useState<string[] | null>(null);
  const weight = Math.max(1, Math.ceil(count * DEFAULT_ITEM_WEIGHT_KG));
  const quote = COURIER_QUOTES.find(c => c.id === courier);
  const shipping = delivery === "pickup" ? 0 : quote ? quote.perKg * weight : 0;
  const sum = checkoutTotal({ subtotal: total, shipping, method });
  const shippingKnown = delivery === "pickup" || !!quote;

  if (done) return <main className="mx-auto max-w-lg px-4 py-16 text-center"><CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-primary" /><h1 className="mb-2 font-display text-2xl font-semibold">Pesanan dibuat</h1><p className="mb-1 text-sm">{done.join(", ")} · menunggu pembayaran {PAYMENT_METHODS[method].label}</p><p className="mb-6 text-xs text-muted-foreground">Batas bayar mengikuti kedaluwarsa Midtrans. Pesanan tampil di Seller Center → Pesanan.</p><div className="flex justify-center gap-2"><Button asChild variant="outline"><Link to="/">Belanja lagi</Link></Button><Button asChild><Link to="/seller/$section" params={{ section: "orders" }}>Lihat di Seller Center</Link></Button></div></main>;
  if (!lines.length) return <main className="mx-auto max-w-lg px-4 py-20 text-center"><p className="mb-4">Keranjangmu kosong.</p><Button asChild><Link to="/">Mulai Belanja</Link></Button></main>;

  const submit = () => {
    const err = validateCheckout({ delivery, ...form, courier });
    if (err) { setError(err); return; }
    const deadline = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const ids = lines.map(l => placeOrder({ buyer: form.name, productId: l.id, qty: l.qty, type: delivery === "pickup" ? "pickup" : "online", courier: delivery === "pickup" ? "Ambil di toko" : quote!.label, payDeadline: deadline }));
    lines.forEach(l => setQty(l.id, l.variant, 0));
    setDone(ids);
  };
  const opt = (on: boolean) => `flex w-full items-start gap-3 rounded-md border p-4 text-left text-sm transition ${on ? "border-primary bg-brand-surface" : "bg-card hover:border-primary/50"}`;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-8">
        <Link to="/keranjang" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"><ChevronLeft className="h-3.5 w-3.5" />Kembali ke keranjang</Link>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Checkout</h1>
        <section className="space-y-3"><h2 className="font-display text-lg font-semibold">1. Cara terima barang</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className={opt(delivery === "kurir")} onClick={() => setDelivery("kurir")}><Truck className="h-5 w-5 text-primary" /><span><b>Kirim kurir</b><br /><span className="text-xs text-muted-foreground">Ongkir dari API ekspedisi</span></span></button>
            <button type="button" className={opt(delivery === "pickup")} onClick={() => setDelivery("pickup")}><Store className="h-5 w-5 text-primary" /><span><b>Ambil di toko</b><br /><span className="text-xs text-muted-foreground">{STORE.name}, {STORE.city} · tanpa ongkir · ambil ≤ {PICKUP_WINDOW_DAYS} hari</span></span></button>
          </div></section>
        <section className="space-y-3"><h2 className="font-display text-lg font-semibold">2. Data penerima</h2>
          <div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Nama penerima" placeholder="Nama penerima" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /><Input aria-label="Nomor HP" placeholder="Nomor HP (08…)" inputMode="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          {delivery === "kurir" && <textarea aria-label="Alamat lengkap" placeholder="Alamat lengkap, kecamatan, kota, kode pos" rows={3} className="w-full rounded-md border bg-background p-3 text-sm" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />}
        </section>
        {delivery === "kurir" && <section className="space-y-3"><h2 className="font-display text-lg font-semibold">3. Kurir</h2>
          {!form.address.trim() ? <p className="text-sm text-muted-foreground">Isi alamat dulu untuk melihat tarif kurir.</p> : <div className="space-y-2">{COURIER_QUOTES.map(c => <button key={c.id} type="button" className={opt(courier === c.id)} onClick={() => setCourier(c.id)}><span className="flex-1"><b>{c.label}</b> <span className="text-xs text-muted-foreground">· {c.eta} · {weight} kg</span></span><b>{rp(c.perKg * weight)}</b></button>)}<p className="text-[11px] text-muted-foreground">Tarif simulasi prototipe. Selisih berat di ekspedisi ditanggung toko.</p></div>}
        </section>}
        <section className="space-y-3"><h2 className="font-display text-lg font-semibold">{delivery === "kurir" ? "4" : "3"}. Pembayaran</h2>
          <div className="space-y-2">{(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map(m => { const pm = PAYMENT_METHODS[m]; return <button key={m} type="button" className={opt(method === m)} onClick={() => setMethod(m)}>{m === "qris" ? <QrCode className="h-5 w-5 text-primary" /> : <Landmark className="h-5 w-5 text-primary" />}<span className="flex-1"><b>{pm.label}</b></span><span className="text-xs text-muted-foreground">Biaya {pm.rate ? `${(pm.rate * 100).toFixed(1)}%` : rp(pm.flat)}</span></button>; })}</div>
        </section>
      </div>
      <aside className="h-fit space-y-3 border-t pt-5 lg:sticky lg:top-44 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
        <h2 className="font-display text-xl font-semibold">Ringkasan</h2>
        {lines.map(l => <div key={l.id + l.variant} className="flex justify-between gap-3 text-xs"><span className="line-clamp-1">{l.qty}× {l.product.name}</span><span>{rp(l.qty * l.product.price)}</span></div>)}
        <div className="space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{rp(sum.subtotal)}</span></div>
          <div className="flex justify-between"><span>Ongkir</span><span>{delivery === "pickup" ? "Rp0 (ambil di toko)" : quote ? rp(shipping) : <span className="text-muted-foreground">Pilih kurir</span>}</span></div>
          <div className="flex justify-between"><span>Biaya layanan</span><span>{rp(sum.serviceFee)}</span></div>
          <div className="flex justify-between"><span>Biaya pembayaran ({PAYMENT_METHODS[method].label})</span><span>{shippingKnown ? rp(sum.paymentFee) : "—"}</span></div>
        </div>
        <div className="flex items-center justify-between border-t pt-3"><span className="font-semibold">Total bayar</span><span className="font-display text-2xl font-bold text-sale">{shippingKnown ? rp(sum.total) : "—"}</span></div>
        {error && <p role="alert" className="text-xs text-sale">{error}</p>}
        <Button variant="coral" size="lg" className="h-12 w-full rounded-md font-semibold shadow-none" onClick={submit}>Buat pesanan & bayar</Button>
        <p className="text-[11px] text-muted-foreground">Prototipe: tidak ada pembayaran sungguhan. Dana dibagi otomatis lewat Midtrans (5% Tabyte, sisanya ke toko; ambil di toko tanpa fee).</p>
      </aside>
    </main>
  );
}
