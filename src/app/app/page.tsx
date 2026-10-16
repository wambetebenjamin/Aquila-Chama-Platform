import { auth } from "@/lib/auth";
import { getChama, metrics } from "@/lib/data";
import {
  ContributionDonutChart,
  SavingsLineChart,
} from "@/components/charts/Charts";
import { Kpi, PageHeader, Panel } from "@/components/dashboard/ui";
import { formatDate, formatKES } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const m = metrics(chama);

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={`${chama.settings.name}, ${chama.settings.county} County`}
      />

      {/* KPI row: 4 col -> 2 col -> 1 col */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total Savings"
          value={formatKES(m.totalSavings)}
          hint="All contributions marked paid"
        />
        <Kpi
          label="Monthly Target"
          value={formatKES(m.monthlyTarget)}
          hint={`${m.activeMembers} active members x ${formatKES(chama.settings.contributionAmount)}`}
        />
        <Kpi
          label="Loans Outstanding"
          value={formatKES(m.loansOutstanding)}
          hint={`${chama.loans.filter((l) => !["CLEARED", "REJECTED"].includes(l.status)).length} active facilities`}
          tone="warning"
        />
        <Kpi
          label="Next Meeting Date"
          value={m.nextMeeting ? formatDate(m.nextMeeting.date) : "Not scheduled"}
          hint={m.nextMeeting ? `${m.nextMeeting.time}, ${chama.settings.meetingDay}` : "Schedule one in Meetings"}
          tone="success"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Savings growth over 12 months">
          <SavingsLineChart
            data={m.savingsGrowth.map((p) => ({
              month: p.month,
              cumulative: p.cumulative,
            }))}
          />
        </Panel>

        <Panel
          title="Contribution rate this month"
          action={
            <span className="chip">
              {m.rate.collectedPercent}% collected
            </span>
          }
        >
          <ContributionDonutChart
            paid={m.rate.paid}
            pending={m.rate.pending}
            overdue={m.rate.overdue}
          />
          <p style={{ margin: "0.5rem 0 0", fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
            {formatKES(m.rate.collectedAmount)} of {formatKES(m.rate.targetAmount)}{" "}
            collected. {m.rate.pending} pending, {m.rate.overdue} overdue.
          </p>
        </Panel>
      </div>

      <Panel title="Recent activity">
        <ul className="list-none p-0" style={{ margin: 0 }}>
          {chama.activity.slice(0, 8).map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1 border-b py-3 sm:flex-row sm:items-center sm:gap-4"
              style={{ borderColor: "var(--color-gray-200)" }}
            >
              <span
                className="shrink-0"
                style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)", minWidth: 88 }}
              >
                {formatDate(entry.at)}
              </span>
              <span style={{ fontSize: "15px", color: "var(--color-gray-800)" }}>
                {entry.message}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
