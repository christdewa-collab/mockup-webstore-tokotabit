import { createFileRoute, notFound } from "@tanstack/react-router";
import { SellerPage } from "@/components/portal/seller";
import { sellerSections } from "@/lib/prototype-data";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/seller/$section")({
  loader: ({ params }) => { const section = sellerSections.find(s => s.id === params.section); if (!section) throw notFound(); return section; },
  head: ({ loaderData }) => pageMeta(`${loaderData?.label ?? "Halaman tidak tersedia"} — Seller Center`, `Kelola ${loaderData?.label.toLowerCase() ?? "toko"} di Seller Center Tabyte.`),
  component: Page,
});
function Page() { const { section } = Route.useParams(); return <SellerPage section={section} />; }
