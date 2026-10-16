"use client";

import { useState } from "react";
import { ArrowRight, Download, FileText } from "lucide-react";
import Link from "next/link";
import {
  ContributionBarChart,
  ContributionDonutChart,
  SavingsLineChart,
} from "@/components/charts/Charts";
import { formatDate, formatKES, formatMonth } from "@/lib/format";
import type { Chama } from "@/lib/types";

type Tab = "overview" | "members" | "contributions" | "loans" | "reports";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "contributions", label: "Contributions" },
  { id: "loans", label: "Loans" },
  { id: "reports", label: "Reports" },
];

/**
 * Public demo dashboard. Server-rendered dummy data, no login required.
 * Dummy chama: Maendeleo Investment Group.
 */
export default function DemoDashboard({ chama }: { chama: Chama }) {
  const [tab, setTab] = useState<Tab>("overview");

  const currentMonth = "2026-10";
  const monthRows = chama.contributions.filter((c) => c.month === currentMonth);
  const paidIds = new Set(
    monthRows.filter((c) => c.status === "PAID").map((c) => c.memberId),
  );
  const overdueIds = new Set(
    monthRows.filter((c) => c.status === "OVERDUE").map((c) => c.memberId),
  );

  const totalSavings = chama.contributions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);
  const activeMembers = chama.members.filter((m) => m.status === "ACTIVE").length;
  const target = activeMembers * chama.settings.contributionAmount;
  const collected = monthRows
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);
  const collectedPercent = Math.round((collected / target) * 100);
  const outstanding = chama.loans
    .filter((l) => !["CLEARED", "REJECTED"].includes(l.status))
    .reduce((sum, l) => sum + l.balance, 0);
  const nextMeeting = chama.meetings
    .filter((m) => m.date >= "2026-10-11")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const growth = Array.from({ length: 12 }, (_, i) => {
    const month = [
      "2025-11","2025-12","2026-01","2026-02","2026-03","2026-04",
      "2026-05","2026-06","2026-07","2026-08","2026-09","2026-10",
    ][i];
    const monthTotal = chama.contributions
      .filter((c) => c.month === month && c.status === "PAID")
      .reduce((sum, c) => sum + c.amount, 0);
    return { month, monthTotal };
  });

  const cumulative = growth.reduce<{ month: string; cumulative: number }[]>(
    (acc, row, i) => [
      ...acc,
      { month: row.month, cumulative: row.monthTotal + (acc[i - 1]?.cumulative ?? 0) },
    ],
    [],
  );

  const memberStatus = (id: string) => {
    if (paidIds.has(id))
      return { label: "Paid", className: "badge badge-success" };
    if (overdueIds.has(id))
      return { label: "Overdue", className: "badge badge-danger" };
    return { label: "Pending", className: "badge badge-warning" };
  };

  return (
    <>
      {/* Persistent CTA banner */}
      <div
        className="sticky top-[76px] z-[80] w-full"
        style={{ background: "var(--color-primary)", color: "var(--color-white)" }}
      >
        <div
          className="container flex flex-col items-center justify-between gap-3 py-3 text-center sm:flex-row sm:text-left"
          style={{ fontSize: "15px" }}
        >
          <span>
            This is a demo. Register your chama to work with your own numbers.
          </span>
          <Link
            href="/#register"
            className="btn btn-white"
            style={{ minHeight: 44 }}
          >
            Register Your Chama
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <section className="site-section-sm" style={{ paddingTop: "2.5rem" }}>
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-sub-title">Live demo</span>
              <h1 className="section-title mb-1">{chama.settings.name}</h1>
              <p style={{ margin: 0, color: "var(--color-gray-600)", fontSize: "15px" }}>
                {chama.settings.county} County &bull;{" "}
                {formatKES(chama.settings.contributionAmount)} monthly &bull;{" "}
                {chama.settings.meetingDay} meetings
              </p>
            </div>
            <Link href="/demo" className="btn btn-outline-primary" style={{ minHeight: 44 }}>
              Reset demo data
            </Link>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Demo sections"
            className="mb-8 flex gap-2 overflow-x-auto pb-2"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                id={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className="btn shrink-0"
                style={{
                  minHeight: 44,
                  background: tab === t.id ? "var(--color-primary)" : "transparent",
                  color: tab === t.id ? "var(--color-white)" : "var(--color-gray-700)",
                  borderColor:
                    tab === t.id ? "var(--color-primary)" : "var(--color-border)",
                  fontSize: "var(--text-meta)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
              <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi label="Total savings balance" value={formatKES(totalSavings)} />
                <Kpi label="Total members" value={String(chama.members.length)} />
                <Kpi
                  label={`${formatMonth(currentMonth)} contributions`}
                  value={`${collectedPercent}%`}
                  hint={`${formatKES(collected)} of ${formatKES(target)}`}
                />
                <Kpi label="Outstanding loans" value={formatKES(outstanding)} />
                <Kpi
                  label="Next meeting"
                  value={nextMeeting ? formatDate(nextMeeting.date) : "To be scheduled"}
                  hint={nextMeeting ? nextMeeting.time : undefined}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Savings growth, 12 months">
                  <SavingsLineChart data={cumulative} />
                </Panel>
                <Panel title={`Contribution rate, ${formatMonth(currentMonth)}`}>
                  <ContributionDonutChart
                    paid={paidIds.size}
                    pending={Math.max(
                      0,
                      activeMembers - paidIds.size - overdueIds.size,
                    )}
                    overdue={overdueIds.size}
                  />
                </Panel>
              </div>
            </div>
          )}

          {/* Members */}
          {tab === "members" && (
            <div role="tabpanel" id="panel-members" aria-labelledby="tab-members">
              <Panel title="Members and contribution status">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Member</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Joined</th>
                        <th scope="col">{formatMonth(currentMonth)}</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chama.members.map((m) => {
                        const s = memberStatus(m.id);
                        return (
                          <tr key={m.id}>
                            <td style={{ fontWeight: 600 }}>{m.name}</td>
                            <td>{m.phone}</td>
                            <td>{formatDate(m.joinDate)}</td>
                            <td>
                              <span className={s.className}>{s.label}</span>
                            </td>
                            <td>
                              <span
                                className={
                                  m.status === "ACTIVE"
                                    ? "badge badge-info"
                                    : "badge badge-muted"
                                }
                              >
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="form-hint mt-3">
                  Green is paid, amber is pending, red is overdue.
                </p>
              </Panel>
            </div>
          )}

          {/* Contributions */}
          {tab === "contributions" && (
            <div role="tabpanel" id="panel-contributions" aria-labelledby="tab-contributions">
              <Panel title="Monthly contribution history">
                <ContributionBarChart data={growth} />
              </Panel>

              <div className="mt-6">
                <Panel title="Recent contributions">
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Member</th>
                          <th scope="col">Month</th>
                          <th scope="col">Amount</th>
                          <th scope="col">Method</th>
                          <th scope="col">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chama.contributions
                          .slice()
                          .reverse()
                          .slice(0, 15)
                          .map((c) => (
                            <tr key={c.id}>
                              <td>{formatDate(c.paidOn)}</td>
                              <td style={{ fontWeight: 600 }}>
                                {chama.members.find((m) => m.id === c.memberId)?.name}
                              </td>
                              <td>{formatMonth(c.month)}</td>
                              <td>{formatKES(c.amount)}</td>
                              <td>{c.method}</td>
                              <td>{c.reference}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {/* Loans */}
          {tab === "loans" && (
            <div role="tabpanel" id="panel-loans" aria-labelledby="tab-loans">
              <Panel title="Active loans">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Member</th>
                        <th scope="col">Purpose</th>
                        <th scope="col">Principal</th>
                        <th scope="col">Balance</th>
                        <th scope="col">Monthly</th>
                        <th scope="col">Next due</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chama.loans.map((l) => (
                        <tr key={l.id}>
                          <td style={{ fontWeight: 600 }}>
                            {chama.members.find((m) => m.id === l.memberId)?.name}
                          </td>
                          <td style={{ maxWidth: 260 }}>{l.purpose}</td>
                          <td>{formatKES(l.amount)}</td>
                          <td>{formatKES(l.balance)}</td>
                          <td>{formatKES(l.monthlyRepayment)}</td>
                          <td>{l.nextDueDate ? formatDate(l.nextDueDate) : "-"}</td>
                          <td>
                            <span
                              className={
                                l.status === "OVERDUE"
                                  ? "badge badge-warning"
                                  : l.status === "CLEARED"
                                    ? "badge badge-success"
                                    : l.status === "AWAITING_GUARANTORS"
                                      ? "badge badge-muted"
                                      : "badge badge-info"
                              }
                            >
                              {l.status.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}

          {/* Reports */}
          {tab === "reports" && (
            <div role="tabpanel" id="panel-reports" aria-labelledby="tab-reports">
              <Panel title="Sample monthly statement">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <FileText size={32} className="text-primary" aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--color-black)" }}>
                      Maendeleo Investment Group, Sept to Oct 2026
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                      Savings balance, contributions table, loans table, meeting
                      log and dividend calculation.
                    </p>
                  </div>
                  <a
                    className="btn btn-primary"
                    href="/api/reports/generate"
                    onClick={(e) => {
                      // Static demo: build the sample client-side is not possible,
                      // so this button previews the report layout description.
                      e.preventDefault();
                      window.alert(
                        "Sign in at /app and open the Reports tab to download the real PDF statement.",
                      );
                    }}
                  >
                    <Download size={18} aria-hidden="true" />
                    Download sample PDF
                  </a>
                </div>
              </Panel>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="kpi-card">
      <p className="kpi-label" style={{ margin: 0 }}>
        {label}
      </p>
      <p className="kpi-value" style={{ margin: "0.5rem 0 0" }}>
        {value}
      </p>
      {hint && (
        <p style={{ margin: "0.25rem 0 0", fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
