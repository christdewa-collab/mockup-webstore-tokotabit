import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { rp } from "@/lib/store-data";
import { ProductTile } from "@/components/store/parts";
import { calculateCartQuote } from "@/lib/prototype-data";

export const Route = createFileRoute("/keranjang")({
  head: () => ({
    meta: [
      { title: "Keranjang Belanja — Tabyte" },
      { name: "description", content: "Cek barang di keranjangmu dan lanjutkan ke pembayaran di Tabyte." },
      { property: "og:title", content: "Keranjang Belanja — Tabyte" },
      { property: "og:description", content: "Cek barang di keranjangmu di Tabyte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { lines, total, count, setQty } = useCart();
  const quote = calculateCartQuote(total);
  if (!lines.length) return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-brand-surface text-primary"><ShoppingCart className="h-9 w-9" strokeWidth={1.5} /></div>
      <h1 className="mb-3 font-display text-2xl font-semibold sm:text-3xl">Keranjangmu masih kosong</h1>
      <p className="mb-7 text-sm text-muted-foreground">Yuk, temukan pilihan favoritmu di Tabyte.</p>
      <Button asChild size="lg" className="h-11 rounded-md font-semibold shadow-none"><Link to="/">Mulai Belanja<ArrowRight className="h-4 w-4" /></Link></Button>
    </main>
  );
  return (
    <main className="mx-auto grid max-w-7xl gap-7 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:px-8">
      <section className="min-w-0 space-y-4">
        <Link to="/" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"><ChevronLeft className="h-3.5 w-3.5" />Lanjut belanja</Link>
        <h1 className="pb-2 font-display text-2xl font-semibold sm:text-3xl">Keranjang <span className="text-muted-foreground">({count})</span></h1>
        {lines.map((l) => (
          <div key={l.id + l.variant} className="flex min-w-0 gap-3 border-b pb-4 sm:gap-5">
            <Link to="/produk/$id" params={{ id: l.id }} className="w-20 shrink-0 overflow-hidden rounded-lg border sm:w-28"><ProductTile p={l.product} /></Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div>
                <p className="line-clamp-2 text-sm font-medium">{l.product.name}</p>
                <span className="mt-1.5 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{l.variant}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-lg font-semibold text-sale">{rp(l.product.price * l.qty)}</span>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 items-center rounded-md border bg-card">
                    <Button variant="ghost" size="icon" aria-label="Kurangi" title="Kurangi jumlah" className="h-7 w-7" onClick={() => setQty(l.id, l.variant, l.qty - 1)}><Minus className="h-3.5 w-3.5" /></Button>
                    <span className="w-7 text-center text-xs font-semibold">{l.qty}</span>
                    <Button variant="ghost" size="icon" aria-label="Tambah" title="Tambah jumlah" className="h-7 w-7" onClick={() => setQty(l.id, l.variant, l.qty + 1)}><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Hapus" title="Hapus barang" className="h-8 w-8 text-destructive" onClick={() => setQty(l.id, l.variant, 0)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
      <aside className="h-fit space-y-4 border-t py-5 lg:sticky lg:top-44 lg:border-l lg:border-t-0 lg:py-0 lg:pl-7">
        <h2 className="font-display text-xl font-semibold">Ringkasan Belanja</h2>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">{rp(total)}</span></div>
        <div className="flex justify-between gap-3 text-sm"><span>Ongkir</span><span className="text-right text-muted-foreground">{quote.shipping === null ? "Belum dihitung" : rp(quote.shipping)}</span></div>
        <p className="text-xs leading-5 text-muted-foreground">Ongkir mengikuti alamat, berat barang, dan kurir pilihan.</p>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4"><span className="font-semibold">Total barang</span><span className="font-display text-2xl font-bold text-sale">{rp(quote.itemsTotal)}</span></div>
        <Button variant="coral" size="lg" className="h-12 w-full rounded-md text-sm font-semibold shadow-none" onClick={() => toast("Pembayaran belum aktif pada prototipe ini.")}>Checkout<ArrowRight className="h-4 w-4" /></Button>
      </aside>
    </main>
  );
}
