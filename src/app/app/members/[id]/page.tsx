import Link from "next/link";
import { auth } from "@/lib/auth";
import { getChama, loanBalance, memberById, memberContributions, memberLoans, paidCount } from "@/lib/data";
import { Kpi, PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { formatDate, formatKES, formatMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const chama = await getChama(session?.user?.chamaId || undefined);
  const member = memberById(chama, id);

  if (!member) {
    return (
      <Panel title="Member not found">
        <p>That member is not on this register.</p>
        <Link href="/app/members" className="btn btn-outline-primary">
          Back to members
        </Link>
      </Panel>
    );
  }

  const contributions = memberContributions(chama, member.id);
  const loans = memberLoans(chama, member.id);
  const total = contributions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <PageHeader
        title={member.name}
        subtitle={`${member.phone} · ID ${member.idNumber || "not recorded"} · Joined ${formatDate(member.joinDate)}`}
        action={
          <Link href="/app/members" className="btn btn-outline-primary">
            Back to members
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Contributions paid" value={`${paidCount(chama, member.id)} months`} />
        <Kpi label="Total contributed" value={formatKES(total)} />
        <Kpi
          label="Loan balance"
          value={formatKES(loanBalance(chama, member.id))}
          tone={loanBalance(chama, member.id) > 0 ? "warning" : "success"}
        />
        <Kpi label="Status" value={member.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Contribution history">
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Method</th>
                  <th scope="col">Reference</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {contributions.length === 0 && (
                  <tr>
                    <td colSpan={5}>No contributions recorded yet.</td>
                  </tr>
                )}
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td>{formatMonth(c.month)}</td>
                    <td>{formatKES(c.amount)}</td>
                    <td>{c.method}</td>
                    <td>{c.reference}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Loan history">
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col">Applied</th>
                  <th scope="col">Principal</th>
                  <th scope="col">Balance</th>
                  <th scope="col">Monthly</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 && (
                  <tr>
                    <td colSpan={5}>No loans taken by this member.</td>
                  </tr>
                )}
                {loans.map((l) => (
                  <tr key={l.id}>
                    <td>{formatDate(l.appliedOn)}</td>
                    <td>{formatKES(l.amount)}</td>
                    <td>{formatKES(l.balance)}</td>
                    <td>{formatKES(l.monthlyRepayment)}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loans.map((l) => (
            <div
              key={`repay-${l.id}`}
              className="mt-4 rounded p-4"
              style={{ background: "var(--color-light)", border: "1px solid var(--color-border)" }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>{l.purpose}</p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                {l.repayments.length} repayments · next due{" "}
                {l.nextDueDate ? formatDate(l.nextDueDate) : "not scheduled"}
              </p>
              <ul className="list-none p-0" style={{ margin: "0.75rem 0 0" }}>
                {l.repayments.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between"
                    style={{ fontSize: "13px", padding: "0.25rem 0" }}
                  >
                    <span>{formatDate(r.paidOn)}</span>
                    <span>{formatKES(r.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}
