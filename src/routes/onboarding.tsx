import { createFileRoute } from "@tanstack/react-router";
import { Onboarding } from "@/components/portal/onboarding";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/onboarding")({ head: () => pageMeta("Buka Toko", "Ajukan toko di Tabyte dengan identitas, profil toko, dan informasi usaha."), component: Onboarding });
