import { auth } from "@/lib/auth";
import { getChama } from "@/lib/data";
import LoansWorkspace, { type LoanView } from "@/components/dashboard/LoansWorkspace";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);

  const loans: LoanView[] = chama.loans
    .slice()
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
    .map((loan) => ({
      loan,
      memberName: chama.members.find((m) => m.id === loan.memberId)?.name ?? "Unknown",
      guarantorNames: loan.guarantorIds.map(
        (id) => chama.members.find((m) => m.id === id)?.name ?? "Unknown",
      ),
    }));

  return (
    <>
      <PageHeader
        title="Loans"
        subtitle={`Interest rate ${chama.settings.interestRate}% · two guarantors required`}
      />

      <LoansWorkspace
        loans={loans}
        members={chama.members.map((m) => ({ id: m.id, name: m.name }))}
        viewerMemberId={session?.user?.memberId ?? ""}
        role={session?.user?.role ?? "MEMBER"}
        interestRate={chama.settings.interestRate}
      />
    </>
  );
}
