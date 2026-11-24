import { Link } from "@tanstack/react-router";
import { ArrowRight, ChartNoAxesCombined, Package, ShoppingBag, Store, ShieldCheck, Wallet, FileCheck, ScrollText, Scale, CreditCard, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { sellerSections, adminSections } from "@/lib/prototype-data";
import { usePrototype } from "@/lib/prototype";

const icons = [ChartNoAxesCombined, Package, ShoppingBag, Store, FileCheck, Wallet, Scale, ScrollText];
export function Status({ children }: { children: string }) {
  const good = ["Aktif", "Live", "Selesai", "Disetujui", "Terverifikasi"].includes(children);
  const bad = ["Perlu perbaikan", "Draft"].includes(children);
  return <span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold ${good ? "bg-mint/35 text-success" : bad ? "bg-sale-soft text-sale" : "bg-sunny/30 text-sunny-foreground"}`}><span className="h-1 w-1 rounded-full bg-current" />{children}</span>;
}
export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">{eyebrow}</p><h1 className="text-3xl font-extrabold text-brand-ink sm:text-4xl">{title}<span className="text-coral">.</span></h1></div>{children}</div>;
}
export function Stat({ label, value, note, icon: Icon = ChartNoAxesCombined }: { label: string; value: string; note: string; icon?: typeof ChartNoAxesCombined }) {
  return <div className="min-w-0 rounded-lg border bg-card p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{label}</span><Icon className="h-4 w-4 shrink-0 text-primary" /></div><p className="break-words text-xl font-bold text-brand-ink sm:text-2xl">{value}</p><p className="mt-2 text-[10px] text-muted-foreground">{note}</p></div>;
}
export function PortalLayout({ mode, section, children }: { mode: "seller" | "admin"; section: string; children: ReactNode }) {
  const { shops } = usePrototype();
  const sections = mode === "seller" ? sellerSections : adminSections;
  return <div className="mx-auto grid min-h-[calc(100dvh-100px)] max-w-[1440px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)]">
    <aside className="min-w-0 border-b bg-card lg:border-b-0 lg:border-r">
      <div className="hidden px-6 py-7 lg:block"><span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">{mode === "seller" ? <Store className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</span><p className="text-sm font-bold text-brand-ink">{mode === "seller" ? shops[0]?.name : "Operasional Tabyte"}</p><p className="mt-1 text-xs text-muted-foreground">{mode === "seller" ? "Seller Center" : "Webmaster"}</p></div>
      <nav aria-label={mode === "seller" ? "Menu penjual" : "Menu Webmaster"} className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:px-4">
        {sections.map((s, i) => { const Icon = mode === "admin" && s.id === "accounts" ? CreditCard : icons[i] ?? Store; return <Button key={s.id} asChild variant={section === s.id ? "secondary" : "ghost"} className={`h-10 shrink-0 justify-start gap-3 text-xs lg:w-full ${section === s.id ? "bg-primary-soft font-semibold text-primary" : "text-muted-foreground"}`}>
          {mode === "seller" ? s.id ? <Link to="/seller/$section" params={{ section: s.id }}><Icon />{s.label}</Link> : <Link to="/seller"><Icon />{s.label}</Link> : s.id ? <Link to="/admin/$section" params={{ section: s.id }}><Icon />{s.label}</Link> : <Link to="/admin"><Icon />{s.label}</Link>}
        </Button>; })}
      </nav>
      <div className="hidden border-t px-6 py-5 lg:block"><Button asChild variant="link" className="h-auto p-0 text-xs"><Link to="/">Lihat toko<ArrowUpRight /></Link></Button><p className="mt-6 text-[10px] text-muted-foreground">Mode prototipe · Data contoh</p></div>
    </aside>
    <main className="min-w-0 overflow-x-hidden bg-editorial px-4 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</main>
  </div>;
}
export function Empty({ label }: { label: string }) {
  return <div className="border-y py-12 text-center"><Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{label}</p></div>;
}
export function SectionLink({ mode, section, children }: { mode: "seller" | "admin"; section: string; children: ReactNode }) {
  return <Button asChild variant="link" className="h-auto p-0 text-xs">{mode === "seller" ? <Link to="/seller/$section" params={{ section }}>{children}<ArrowRight /></Link> : <Link to="/admin/$section" params={{ section }}>{children}<ArrowRight /></Link>}</Button>;
}