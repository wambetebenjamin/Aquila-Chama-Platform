import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChama } from "@/lib/data";
import DashboardShell from "@/components/dashboard/DashboardShell";

/**
 * Authenticated chama dashboard.
 * SSR only, no caching. Middleware blocks /app without a session; this layout
 * is the second line of defence and also loads the chama for every page.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/app");
  }

  const chamaId = session.user.chamaId || undefined;
  const chama = await getChama(chamaId);

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      chamaName={chama.settings.name}
      county={chama.settings.county}
    >
      {children}
    </DashboardShell>
  );
}
