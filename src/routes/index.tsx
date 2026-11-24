import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Truck, BadgePercent, ShieldCheck } from "lucide-react";
import coverBlue from "@/assets/cover-blue.jpg";

import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS, discount, rp } from "@/lib/store-data";
import { CATEGORY_IMAGES, PRODUCT_IMAGES } from "@/lib/store-presentation";
import { ProductCard } from "@/components/store/parts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tabyte — Perkakas, Elektronik & Kebutuhan Rumah" },
      { name: "description", content: "Temukan perkakas, alat listrik, elektronik, dan kebutuhan rumah pilihan di Tabyte. Belanja seru dengan flash sale dan harga bersahabat." },
      { property: "og:title", content: "Tabyte — Perkakas, Elektronik & Kebutuhan Rumah" },
      { property: "og:description", content: "Pilihan untuk setiap kebutuhan. Belanja perkakas, elektronik, dan kebutuhan rumah dengan harga bersahabat di Tabyte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const BANNERS = [
  { eyebrow: "PILIHAN TABYTE", title: "Pilihan yang pas.", sub: "Perkakas, elektronik & kebutuhan rumah." },
  { eyebrow: "PILIHAN TABYTE", title: "Siap untuk proyek berikutnya.", sub: "Temukan perkakas untuk setiap kebutuhanmu." },
  { eyebrow: "RUMAH LEBIH LENGKAP", title: "Hidup lebih mudah.", sub: "Pilihan barang untuk kebutuhan sehari-hari." },
];

function Cover() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setI((x) => (x + 1) % BANNERS.length), 6500);
    return () => clearInterval(timer);
  }, [paused]);
  const b = BANNERS[i];
  if (!b) return null;
  return (
    <section aria-label="Promo Tabyte" aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} className="relative isolate h-[380px] overflow-hidden bg-primary sm:h-[390px] lg:h-[410px]">
      <img src={coverBlue} alt="Bor biru, headphone, kipas, dan perkakas di atas latar biru Tabyte" width={1920} height={1088} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-cover-shade" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 text-primary-foreground sm:px-6 lg:px-8">
        <span className="mb-3 w-fit rounded bg-sunny px-2 py-1 text-[10px] font-bold text-sunny-foreground sm:text-xs">{b.eyebrow}</span>
        <h1 className="max-w-[250px] text-4xl font-extrabold leading-[1.02] sm:max-w-md sm:text-5xl lg:text-6xl">{b.title}</h1>
        <p className="mt-3 max-w-sm text-xs leading-5 text-primary-foreground/85 sm:text-sm">{b.sub}</p>
        <Button asChild className="mt-6 h-10 w-fit gap-2 rounded bg-coral px-4 text-xs font-semibold text-brand-ink hover:bg-coral/85 sm:text-sm"><a href="#pilihan">Belanja sekarang<ArrowRight className="h-4 w-4" /></a></Button>
      </div>
      <div className="absolute bottom-4 left-1/2 z-20 flex w-full max-w-7xl -translate-x-1/2 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {BANNERS.map((_, k) => <Button key={k} aria-label={`Banner ${k + 1}`} aria-pressed={i === k} title={`Promo ${k + 1}`} onClick={() => setI(k)} variant="ghost" className="h-7 w-7 p-0 hover:bg-transparent"><span className={`block h-1.5 rounded-full ${k === i ? "w-5 bg-sunny" : "w-1.5 bg-primary-foreground/50"}`} /></Button>)}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" title="Promo sebelumnya" aria-label="Sebelumnya" onClick={() => setI((x) => (x + BANNERS.length - 1) % BANNERS.length)} className="h-8 w-8 rounded-full bg-card text-brand-ink"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="secondary" size="icon" title="Promo berikutnya" aria-label="Berikutnya" onClick={() => setI((x) => (x + 1) % BANNERS.length)} className="h-8 w-8 rounded-full bg-card text-brand-ink"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ id, tag, title, large = false }: { id: string; tag: string; title: string; large?: boolean }) {
  const p = PRODUCTS.find((product) => product.id === id);
  if (!p) return null;
  return (
    <Link to="/produk/$id" params={{ id }} className={`group relative flex overflow-hidden rounded-md bg-editorial ${large ? "min-h-[300px] flex-col justify-between p-5 sm:min-h-[360px] lg:min-h-0 lg:p-6" : "min-h-[176px] items-center px-5"}`}>
      <div className={`relative z-10 ${large ? "" : "w-1/2 py-5"}`}>
        <span className="inline-block rounded bg-coral px-2 py-1 text-[10px] font-semibold text-brand-ink">{tag}</span>
        <h3 className={`mt-3 font-bold leading-tight text-brand-ink ${large ? "text-xl lg:text-2xl" : "text-lg"}`}>{title}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-display text-base font-semibold text-sale">{rp(p.price)}</span>
          <span className="text-[10px] text-muted-foreground line-through">{rp(p.original)}</span>
          <span className="rounded bg-sunny px-1.5 py-0.5 text-[10px] font-bold text-sunny-foreground">-{discount(p)}%</span>
        </div>
        <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">Lihat produk<ArrowRight className="h-3 w-3" /></span>
      </div>
      <img src={PRODUCT_IMAGES[id]} alt={p.name} width={400} height={400} loading={large ? "eager" : "lazy"} className={large ? "mx-auto mt-2 h-44 w-full flex-1 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 sm:h-52" : "h-40 w-1/2 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"} />
    </Link>
  );
}

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date();
    end.setHours(Math.ceil((end.getHours() + 1) / 3) * 3, 0, 0, 0);
    const tick = () => setLeft(Math.max(0, end.getTime() - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const parts = left == null ? ["--", "--", "--"] : [left / 36e5, (left % 36e5) / 6e4, (left % 6e4) / 1e3].map((n) => String(Math.floor(n)).padStart(2, "0"));
  return <div aria-label="Sisa waktu Flash Sale" className="flex h-7 items-center gap-1 rounded bg-sunny px-2.5 font-display text-sm font-medium tabular-nums text-sunny-foreground">{parts.map((part, k) => <span key={k} className="flex items-center gap-1">{k > 0 && <span className="opacity-60">:</span>}<span className="w-[18px] text-center">{part}</span></span>)}</div>;
}

const BENEFITS = [
  { icon: Truck, title: "Pengiriman pilihan", sub: "JNE, SiCepat & J&T" },
  { icon: BadgePercent, title: "Harga bersahabat", sub: "Pilihan setiap hari" },
  { icon: ShieldCheck, title: "100% Original", sub: "Pilihan berkualitas" },
];

function Index() {
  const flash = PRODUCTS.filter((p) => p.flash);
  return (
    <>
      <Cover />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8">
        <section id="kategori" aria-label="Kategori" className="border-b py-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            {[{ id: "perkakas", label: "PERKAKAS", sub: "Alat kerja untuk hasil maksimal." }, { id: "elektronik", label: "ELEKTRONIK", sub: "Teknologi untuk hidup lebih baik." }, { id: "rumah", label: "RUMAH", sub: "Lengkapi rumah, lengkapi cerita." }].map((c) => <a href="#semua" key={c.id} className="group flex min-w-0 flex-col items-center gap-2 border-r px-1 py-1 last:border-r-0 sm:flex-row sm:justify-between sm:px-4"><div><span className="text-[10px] font-bold text-brand-ink sm:text-sm">{c.label}</span><p className="mt-1 hidden text-xs text-muted-foreground sm:block">{c.sub}</p></div><img src={CATEGORY_IMAGES[c.id]} alt="" width={400} height={400} loading="lazy" className="h-14 w-16 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-24" /></a>)}
          </div>
        </section>
        <section id="pilihan" aria-label="Pilihan editorial" className="border-b py-6">
          <div className="mb-5"><h2 className="text-3xl font-extrabold leading-tight text-brand-ink sm:text-4xl">Barang bagus.<br />Harga bersahabat<span className="text-coral">.</span></h2><p className="mt-2 text-xs text-muted-foreground">Kualitas pilihan untuk kebutuhan sehari-hari.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2"><FeatureCard id="blender" tag="Rumah pilihan" title="Segar setiap hari." large /></div>
            <FeatureCard id="kipas" tag="Rumah nyaman" title="Angin segar setiap saat." />
            <FeatureCard id="lampu" tag="Belajar fokus" title="Cahaya pas untuk mejamu." />
            <FeatureCard id="bor-500w" tag="Perkakas andalan" title="Siap untuk proyekmu." />
            <FeatureCard id="headset" tag="Audio favorit" title="Bass mantap setiap saat." />
          </div>
        </section>
        <section id="flash-sale" className="border-b border-t-2 border-t-primary py-5">
          <div className="mb-4 flex items-center gap-3 sm:gap-4">
            <h2 className="flex shrink-0 items-center gap-1.5 font-display text-xl font-bold text-primary sm:text-2xl"><Zap className="h-5 w-5 fill-coral text-coral sm:h-6 sm:w-6" />Flash Sale</h2>
            <Countdown />
            <div className="ml-1 hidden h-1 flex-1 rounded-full bg-muted sm:block"><div className="h-full w-2/3 rounded-full bg-sunny" /></div>
            <a href="#semua" className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-primary sm:text-xs">Lihat semua<ChevronRight className="h-3.5 w-3.5" /></a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{flash.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
        <section id="semua" className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-bold text-primary sm:text-2xl">Semua produk</h2><Link to="/keranjang" className="flex items-center gap-1 text-xs font-semibold text-primary">Lihat keranjang<ChevronRight className="h-3.5 w-3.5" /></Link></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{PRODUCTS.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
        <div className="mt-8 grid grid-cols-3 border-y py-4">{BENEFITS.map(({ icon: Icon, title, sub }) => <div key={title} className="flex min-w-0 flex-col items-center gap-2 border-r last:border-r-0 sm:flex-row sm:justify-center sm:gap-3"><Icon className="h-6 w-6 text-primary" /><div className="text-center sm:text-left"><p className="text-[10px] font-semibold sm:text-sm">{title}</p><p className="mt-1 hidden text-xs text-muted-foreground sm:block">{sub}</p></div></div>)}</div>
        <footer className="mt-10 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="font-display text-lg font-semibold text-brand-ink">Tabyte.</span><span>Perkakas, elektronik, dan kebutuhan rumah.</span></footer>
      </main>
    </>
  );
}
