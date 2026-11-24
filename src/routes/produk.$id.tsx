import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Star, Store, Truck, ChevronRight, ShoppingCart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { PRODUCTS, STORE, discount, getProduct, rp, soldLabel } from "@/lib/store-data";
import { ProductCard, ProductTile } from "@/components/store/parts";

export const Route = createFileRoute("/produk/$id")({
  loader: ({ params }) => { const p = getProduct(params.id); if (!p) throw notFound(); return p; },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} — Tabyte` : "Produk tidak ditemukan — Tabyte";
    const d = loaderData ? `${rp(loaderData.price)} (hemat ${discount(loaderData)}%). ${loaderData.desc}` : "Produk tidak tersedia.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: () => <div className="p-10 text-center"><p className="mb-4 font-display text-2xl">Produk tidak ditemukan 😢</p><Link to="/" className="font-bold text-primary">Kembali belanja</Link></div>,
  component: Detail,
});

function Detail() {
  const p = Route.useLoaderData();
  const { add } = useCart();
  const nav = useNavigate();
  const [variant, setVariant] = useState<string>(p.variants[0] ?? "");
  const [qty, setQty] = useState(1);
  const addCart = () => { add(p.id, variant, qty); toast.success("Masuk keranjang! 🛒"); };
  return (
    <main className="mx-auto max-w-7xl space-y-7 px-4 pb-24 pt-5 sm:px-6 lg:px-8">
      <nav aria-label="Jejak halaman" className="flex items-center gap-2 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">Beranda</Link><ChevronRight className="h-3 w-3" /><span className="truncate">{p.name}</span></nav>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div className="relative h-fit overflow-hidden rounded-lg border">
          <ProductTile p={p} size="lg" />
          <span className="absolute left-4 top-4 rounded-md bg-sunny px-3 py-1 text-sm font-bold text-sunny-foreground">-{discount(p)}%</span>
        </div>
        <div className="space-y-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary"><ShieldCheck className="h-4 w-4" />Produk pilihan Tabyte</p>
          <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{p.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Star className="h-4 w-4 fill-sunny text-sunny" /><b className="text-foreground">{p.rating}</b> · {soldLabel(p.sold)} · Stok {p.stock}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y bg-sale-soft/40 px-4 py-5">
            <span className="font-display text-3xl font-semibold text-sale sm:text-4xl">{rp(p.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{rp(p.original)}</span>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Varian</p>
            <div className="flex flex-wrap gap-2">
              {p.variants.map((v) => (
                <Button key={v} variant="outline" aria-pressed={v === variant} onClick={() => setVariant(v)} className={`rounded-md px-4 text-sm shadow-none ${v === variant ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}>{v}</Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold">Jumlah</p>
            <div className="flex h-9 items-center rounded-md border bg-card">
              <Button variant="ghost" size="icon" aria-label="Kurangi" title="Kurangi jumlah" className="h-8 w-8" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="w-9 text-center text-sm font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" aria-label="Tambah" title="Tambah jumlah" className="h-8 w-8" onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"><Truck className="h-4 w-4 shrink-0 text-primary" />Dikirim dari {p.city} · JNE, SiCepat, J&T</div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="h-12 min-w-0 flex-1 gap-2 rounded-md border-primary px-2 text-sm font-semibold text-primary shadow-none" onClick={addCart}><ShoppingCart className="h-4 w-4" />Keranjang</Button>
            <Button variant="coral" size="lg" className="h-12 min-w-0 flex-1 rounded-md px-2 text-sm font-semibold shadow-none" onClick={() => { add(p.id, variant, qty); nav({ to: "/keranjang" }); }}>Beli Sekarang</Button>
          </div>
          <div className="flex items-center gap-3 border-t py-4">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-soft text-primary"><Store className="h-5 w-5" /></span>
            <div><p className="font-bold">{STORE.name}</p><p className="text-xs text-muted-foreground">Toko terverifikasi · {STORE.city}</p></div>
          </div>
        </div>
      </div>
      <section className="border-y py-6">
        <h2 className="mb-3 font-display text-xl font-semibold">Deskripsi Produk</h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{p.desc}</p>
      </section>
      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">Produk Serupa</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PRODUCTS.filter((x) => x.id !== p.id).slice(0, 4).map((x) => <ProductCard key={x.id} p={x} />)}
        </div>
      </section>
    </main>
  );
}
