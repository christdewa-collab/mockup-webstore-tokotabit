import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminPage } from "@/components/portal/admin";
import { adminSections } from "@/lib/prototype-data";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/admin/$section")({
  loader: ({ params }) => { const section = adminSections.find(s => s.id === params.section); if (!section) throw notFound(); return section; },
  head: ({ loaderData }) => pageMeta(`${loaderData?.label ?? "Halaman tidak tersedia"} — Webmaster`, `Tinjau ${loaderData?.label.toLowerCase() ?? "platform"} di Webmaster Tabyte.`),
  component: Page,
});
function Page() { const { section } = Route.useParams(); return <AdminPage section={section} />; }
