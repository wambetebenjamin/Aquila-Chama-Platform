import { auth } from "@/lib/auth";
import { getChama, outstandingContributions } from "@/lib/data";
import { MONTHS } from "@/lib/seed";
import ContributionsWorkspace, {
  type Outstanding,
  type Row,
} from "@/components/dashboard/ContributionsWorkspace";
import RecordContributionForm from "@/components/dashboard/RecordContributionForm";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { CURRENT_MONTH } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function ContributionsPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const canManage = ["ADMIN", "TREASURER"].includes(session?.user?.role ?? "");

  const rows: Row[] = chama.contributions
    .slice()
    .sort((a, b) => b.paidOn.localeCompare(a.paidOn))
    .map((contribution) => ({
      contribution,
      memberName:
        chama.members.find((m) => m.id === contribution.memberId)?.name ?? "Unknown",
    }));

  const outstanding: Outstanding[] = outstandingContributions(chama, CURRENT_MONTH).map(
    (o) => ({
      memberId: o.member.id,
      memberName: o.member.name,
      phone: o.member.phone,
      amount: o.amount,
      month: CURRENT_MONTH,
    }),
  );

  return (
    <>
      <PageHeader
        title="Contributions"
        subtitle={`Monthly contribution ${new Intl.NumberFormat("en-KE").format(
          chama.settings.contributionAmount,
        )} KES per member`}
      />

      {canManage && (
        <div className="mb-6">
          <Panel title="Record a contribution">
            <RecordContributionForm
              members={chama.members.map((m) => ({ id: m.id, name: m.name }))}
              defaultAmount={chama.settings.contributionAmount}
              months={[...MONTHS]}
            />
          </Panel>
        </div>
      )}

      <ContributionsWorkspace
        rows={rows}
        outstanding={outstanding}
        months={[...MONTHS]}
        members={chama.members.map((m) => ({ id: m.id, name: m.name }))}
      />
    </>
  );
}
