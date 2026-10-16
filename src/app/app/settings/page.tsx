import { auth } from "@/lib/auth";
import { getChama } from "@/lib/data";
import SettingsForm from "@/components/dashboard/SettingsForm";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { formatDate, formatKES } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Group profile, contribution amount, meeting day, WhatsApp delivery and loan interest"
      />

      <div className="grid gap-6">
        <Panel title="Chama profile">
          <SettingsForm settings={chama.settings} />
        </Panel>

        <Panel title="Group summary">
          <dl className="grid gap-4 sm:grid-cols-2" style={{ margin: 0 }}>
            <SummaryRow label="Group name" value={chama.settings.name} />
            <SummaryRow
              label="Registration number"
              value={chama.settings.registrationNumber || "Not provided"}
            />
            <SummaryRow label="County" value={chama.settings.county} />
            <SummaryRow
              label="Monthly contribution"
              value={formatKES(chama.settings.contributionAmount)}
            />
            <SummaryRow label="Meeting day" value={chama.settings.meetingDay} />
            <SummaryRow
              label="WhatsApp for delivery"
              value={chama.settings.whatsappNumber}
            />
            <SummaryRow
              label="Interest rate on loans"
              value={`${chama.settings.interestRate}%`}
            />
            <SummaryRow label="Group created" value={formatDate(chama.createdAt.slice(0, 10))} />
          </dl>

          {!isAdmin && (
            <p className="form-hint mt-4">
              You are signed in as a {session?.user?.role?.toLowerCase()}. Only an
              administrator can change group settings.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        style={{
          fontSize: "var(--text-meta)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-gray-600)",
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: "0.25rem 0 0", fontWeight: 600, color: "var(--color-black)" }}>
        {value}
      </dd>
    </div>
  );
}
