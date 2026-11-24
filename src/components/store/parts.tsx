import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Search, Star, MapPin, ChevronRight, Grid2X2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/tabyte-logo.png.asset.json";
import { useCart } from "@/lib/cart";
import { CATEGORIES, discount, rp, soldLabel, type Product } from "@/lib/store-data";
import { PRODUCT_IMAGES } from "@/lib/store-presentation";

export const toneBg: Record<string, string> = {
  primary: "bg-primary-soft", sunny: "bg-sunny/40", coral: "bg-coral/25", mint: "bg-mint/35", sky: "bg-sky/35", grape: "bg-grape/25",
};

export function Header() {
  const { count } = useCart();
  const path = useRouterState({ select: s => s.location.pathname });
  const buyer = !path.startsWith("/seller") && !path.startsWith("/admin") && !path.startsWith("/onboarding");
  return (
    <header className="sticky top-0 z-40 border-b bg-card text-card-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6 sm:py-4 lg:gap-x-8 lg:px-8">
        <Link to="/" aria-label="Tabyte — Beranda" className="flex h-10 w-28 shrink-0 items-center justify-center rounded bg-brand-surface sm:h-12 sm:w-36">
          <img src={logo.url} alt="Tabyte" width={317} height={93} className="h-auto w-24 sm:w-28" />
        </Link>
        {buyer && <div className="order-3 flex h-10 w-full items-center gap-3 rounded border bg-card px-4 text-card-foreground sm:order-none sm:w-auto sm:flex-1">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
          <input aria-label="Cari produk" placeholder="Cari produk di Tabyte" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>}
        <span className="ml-auto hidden text-xs text-muted-foreground xl:block">{buyer ? "Pilihan untuk setiap kebutuhan." : "Mode prototipe · Data contoh"}</span>
        {buyer && <Button asChild variant="ghost" size="icon" className="relative ml-auto h-10 w-10 text-primary sm:ml-0">
          <Link to="/keranjang" aria-label="Keranjang" title="Keranjang"><ShoppingCart className="h-6 w-6" strokeWidth={1.7} />
          {count > 0 && <span className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-brand-ink">{count}</span>}</Link>
        </Button>}
        <Button asChild variant="coral" size="sm" className="ml-auto sm:ml-0"><Link to="/onboarding">Buka toko</Link></Button>
      </div>
      <nav aria-label="Segmen Tabyte" className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-2 text-xs sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className={buyer ? "bg-primary-soft text-primary" : "text-muted-foreground"}><Link to="/">Toko pembeli</Link></Button>
        <Button asChild variant="ghost" size="sm" className={path.startsWith("/seller") ? "bg-primary-soft text-primary" : "text-muted-foreground"}><Link to="/seller">Seller Center</Link></Button>
        <Button asChild variant="ghost" size="sm" className={path.startsWith("/admin") ? "bg-primary-soft text-primary" : "text-muted-foreground"}><Link to="/admin">Webmaster</Link></Button>
        <Button asChild variant="ghost" size="sm" className={path.startsWith("/onboarding") ? "bg-primary-soft text-primary" : "text-muted-foreground"}><Link to="/onboarding">Onboarding</Link></Button>
      </nav>
    </header>
  );
}

export function ProductTile({ p, size = "md" }: { p: Product; size?: "md" | "lg" }) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-card ${size === "lg" ? "rounded-lg" : "rounded-t-lg"}`}>
      <img src={PRODUCT_IMAGES[p.id]} alt={p.name} width={400} height={400} loading={size === "lg" ? "eager" : "lazy"} className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105 sm:p-4" />
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link to="/produk/$id" params={{ id: p.id }} className="group block min-w-0 overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/40">
      <div className="relative">
        <ProductTile p={p} />
        <span className="absolute left-2 top-2 rounded bg-sunny px-1.5 py-0.5 text-[10px] font-bold text-sunny-foreground">-{discount(p)}%</span>
        {p.flash && <span className="absolute bottom-1.5 left-2 flex items-center gap-0.5 text-[10px] font-semibold text-sale"><Zap className="h-3 w-3 fill-sale" />Flash Sale</span>}
      </div>
      <div className="space-y-1.5 p-3 pt-2">
        <h3 className="line-clamp-2 h-9 font-sans text-xs font-medium leading-[18px] text-card-foreground">{p.name}</h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-display text-base font-semibold text-sale">{rp(p.price)}</span>
          <span className="text-[10px] text-muted-foreground line-through">{rp(p.original)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
          <Star className="h-3 w-3 shrink-0 fill-sunny text-sunny" /> <span>{p.rating} · {soldLabel(p.sold)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{p.city}</div>
      </div>
    </Link>
  );
}

export function StickyCart() {
  const { count, total } = useCart();
  const path = useRouterState({ select: s => s.location.pathname });
  if (!count || path.startsWith("/seller") || path.startsWith("/admin") || path.startsWith("/onboarding")) return null;
  return (
    <Button asChild className="fixed bottom-4 right-4 z-50 h-12 max-w-[calc(100%-2rem)] gap-3 rounded-lg bg-primary px-4 font-semibold text-primary-foreground shadow-float sm:bottom-6 sm:right-6">
      <Link to="/keranjang"><ShoppingCart className="h-5 w-5" /><span>{count} barang · {rp(total)}</span><ChevronRight className="h-4 w-4" /></Link>
    </Button>
  );
}
