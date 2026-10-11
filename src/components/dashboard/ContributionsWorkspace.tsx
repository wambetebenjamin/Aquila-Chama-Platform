"use client";

import { useMemo, useRef, useState } from "react";
import { Download, MessageCircle } from "lucide-react";
import { formatDate, formatKES, formatMonth } from "@/lib/format";
import type { Contribution } from "@/lib/types";

export interface Row {
  contribution: Contribution;
  memberName: string;
}

export interface Outstanding {
  memberId: string;
  memberName: string;
  phone: string;
  amount: number;
  month: string;
}

/**
 * Contribution history with month / member / status filters, CSV export, and
 * the outstanding list with a one-tap WhatsApp reminder.
 */
export default function ContributionsWorkspace({
  rows,
  outstanding,
  months,
  members,
}: {
  rows: Row[];
  outstanding: Outstanding[];
  months: string[];
  members: { id: string; name: string }[];
}) {
  const [month, setMonth] = useState("");
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState("");
  const [reminding, setReminding] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string } | null>(null);
  const pendingRef = useRef<{ memberId: string; month: string } | null>(null);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!month || r.contribution.month === month) &&
          (!memberId || r.contribution.memberId === memberId) &&
          (!status || r.contribution.status === status),
      ),
    [rows, month, memberId, status],
  );

  const exportCsv = () => {
    const header = "Date,Member,Month,Amount,Method,Reference,Status\n";
    const body = filtered
      .map((r) =>
        [
          r.contribution.paidOn,
          r.memberName,
          r.contribution.month,
          r.contribution.amount,
          r.contribution.method,
          r.contribution.reference,
          r.contribution.status,
        ]
          .map((v) => (String(v).includes(",") ? `"${v}"` : String(v)))
          .join(","),
      )
      .join("\n");

    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contributions-${month || "all"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeMonth = month || months[months.length - 1] || "";

  async function sendReminder(entry: Outstanding) {
    setReminding(entry.memberId);
    setFeedback(null);
    pendingRef.current = { memberId: entry.memberId, month: entry.month };

    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reminder",
          memberId: entry.memberId,
          month: entry.month,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        link?: string;
        delivered?: boolean;
      };

      if (!json.ok) {
        setFeedback({ id: entry.memberId, text: json.message });
        return;
      }

      if (!json.delivered && json.link) window.open(json.link, "_blank", "noopener");
      setFeedback({ id: entry.memberId, text: json.message });
    } catch {
      setFeedback({ id: entry.memberId, text: "Could not send the reminder." });
    } finally {
      setReminding(null);
    }
  }

  const outstandingForMonth = outstanding.filter(
    (o) => !activeMonth || o.month === activeMonth,
  );

  return (
    <div className="grid gap-6">
      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
            Contribution history
          </h2>
          <button type="button" onClick={exportCsv} className="btn btn-sm btn-outline-primary">
            <Download size={16} aria-hidden="true" />
            Export to CSV
          </button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="form-label" htmlFor="filter-month">
              Month
            </label>
            <select
              id="filter-month"
              className="form-control"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="filter-member">
              Member
            </label>
            <select
              id="filter-member"
              className="form-control"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="filter-status">
              Status
            </label>
            <select
              id="filter-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

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
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>No contributions match these filters.</td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.contribution.id}>
                  <td>{formatDate(r.contribution.paidOn)}</td>
                  <td style={{ fontWeight: 600 }}>{r.memberName}</td>
                  <td>{formatMonth(r.contribution.month)}</td>
                  <td>{formatKES(r.contribution.amount)}</td>
                  <td>{r.contribution.method}</td>
                  <td>{r.contribution.reference}</td>
                  <td>
                    <span
                      className={
                        r.contribution.status === "PAID"
                          ? "badge badge-success"
                          : r.contribution.status === "OVERDUE"
                            ? "badge badge-danger"
                            : "badge badge-warning"
                      }
                    >
                      {r.contribution.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
          Outstanding contributions
        </h2>
        <p style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
          Members who have not paid for{" "}
          {activeMonth ? formatMonth(activeMonth) : "the selected month"}.
        </p>

        {outstandingForMonth.length === 0 ? (
          <p>Everyone has paid. Well done.</p>
        ) : (
          <ul className="list-none p-0">
            {outstandingForMonth.map((entry) => (
              <li
                key={entry.memberId}
                className="flex flex-col gap-3 border-b py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: "var(--color-gray-200)" }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--color-black)" }}>
                    {entry.memberName}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                    {entry.phone} · {formatKES(entry.amount)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                  {feedback?.id === entry.memberId && (
                    <span style={{ fontSize: "var(--text-meta)", color: "var(--color-success)" }}>
                      {feedback.text}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={reminding === entry.memberId}
                    onClick={() => void sendReminder(entry)}
                  >
                    <MessageCircle size={16} aria-hidden="true" />
                    {reminding === entry.memberId ? "Sending" : "Send Reminder"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
