import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/portal/admin";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/admin/")({ head: () => pageMeta("Webmaster", "Ringkasan platform, verifikasi toko, keuangan, dan sengketa di Tabyte."), component: () => <AdminPage /> });
