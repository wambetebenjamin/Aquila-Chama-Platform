import { auth } from "@/lib/auth";
import { getChama, metrics } from "@/lib/data";
import { MONTHS } from "@/lib/seed";
import ReportsWorkspace from "@/components/dashboard/ReportsWorkspace";
import { Kpi, PageHeader } from "@/components/dashboard/ui";
import { formatKES, formatMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const m = metrics(chama);
  const canManage = ["ADMIN", "TREASURER"].includes(session?.user?.role ?? "");

  const months = [...MONTHS];
  const from = months[months.length - 2] ?? months[0];
  const to = months[months.length - 1] ?? months[0];

  const interestEarned = chama.loans.reduce((sum, loan) => {
    const repaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
    return sum + (repaid - Math.min(repaid, loan.amount));
  }, 0);
  const distributable = m.totalSavings + interestEarned - m.loansOutstanding;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={`Statements for ${chama.settings.name}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total savings" value={formatKES(m.totalSavings)} />
        <Kpi label="Interest earned on loans" value={formatKES(interestEarned)} />
        <Kpi
          label="Distributable after loans"
          value={formatKES(distributable)}
          tone="success"
        />
        <Kpi
          label="Dividend per member"
          value={formatKES(Math.round(distributable / Math.max(1, m.activeMembers)))}
          hint={`${m.activeMembers} active members`}
        />
      </div>

      <ReportsWorkspace
        months={months}
        defaultFrom={from}
        defaultTo={to}
        canManage={canManage}
      />

      <p className="form-hint mt-4">
        Scheduled delivery runs on the 5th of every month for{" "}
        {formatMonth(to)} onwards.
      </p>
    </>
  );
}
