import type { Metadata } from "next";
import DemoDashboard from "@/components/demo/DemoDashboard";
import { buildSeedChama } from "@/lib/seed";

/** Demo: SSR with dummy data, public, never cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live demo | Maendeleo Investment Group",
  description:
    "Explore the Aquila Chama Platform dashboard with no login: contributions, loans, members, meetings and reports for a sample Kenyan chama.",
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  const chama = buildSeedChama();
  return <DemoDashboard chama={chama} />;
}
