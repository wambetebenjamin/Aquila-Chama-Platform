"use client";

import { useState } from "react";
import { CalendarClock, Download, Loader2, Share2, FileText } from "lucide-react";
import { formatKES, formatMonth } from "@/lib/format";

/**
 * Reports tab: generate a monthly statement, download the PDF, share it on
 * WhatsApp, and schedule automated monthly delivery.
 */
export default function ReportsWorkspace({
  months,
  defaultFrom,
  defaultTo,
  canManage,
}: {
  months: string[];
  defaultFrom: string;
  defaultTo: string;
  canManage: boolean;
}) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [busy, setBusy] = useState<"pdf" | "share" | "schedule" | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  async function downloadPdf() {
    setBusy("pdf");
    setFeedback(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      if (!res.ok) {
        setFeedback({ text: "Could not generate the report.", ok: false });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `statement-${from}-to-${to}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setFeedback({ text: "Statement generated and downloaded.", ok: true });
    } catch {
      setFeedback({ text: "Could not generate the report.", ok: false });
    } finally {
      setBusy(null);
    }
  }

  async function deliver(schedule: "once" | "monthly") {
    setBusy(schedule === "monthly" ? "schedule" : "share");
    setFeedback(null);
    try {
      const res = await fetch("/api/reports/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, channel: "whatsapp", schedule }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        link?: string | null;
        delivered?: number;
        summary?: {
          totalSavings: number;
          loansOutstanding: number;
          dividendPerMember: number;
        };
      };

      if (!json.ok) {
        setFeedback({ text: json.message, ok: false });
        return;
      }
      if (json.link && !json.delivered) window.open(json.link, "_blank", "noopener");
      setFeedback({ text: json.message, ok: true });
    } catch {
      setFeedback({ text: "Could not deliver the report.", ok: false });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
          Generate monthly statement
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="report-from">
              From
            </label>
            <select
              id="report-from"
              className="form-control"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="report-to">
              To
            </label>
            <select
              id="report-to"
              className="form-control"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void downloadPdf()}
            disabled={busy !== null}
          >
            {busy === "pdf" ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Download size={18} aria-hidden="true" />
            )}
            {busy === "pdf" ? "Generating" : "Generate PDF report"}
          </button>

          {canManage && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void deliver("once")}
                disabled={busy !== null}
              >
                <Share2 size={18} aria-hidden="true" />
                {busy === "share" ? "Sharing" : "Share report on WhatsApp"}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => void deliver("monthly")}
                disabled={busy !== null}
              >
                <CalendarClock size={18} aria-hidden="true" />
                {busy === "schedule" ? "Scheduling" : "Schedule monthly delivery"}
              </button>
            </>
          )}
        </div>

        {feedback && (
          <p
            role="status"
            style={{
              marginTop: "1rem",
              fontSize: "var(--text-meta)",
              color: feedback.ok ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {feedback.text}
          </p>
        )}
      </section>

      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
          What goes in the report
        </h2>
        <ul className="ul-check primary mb-0">
          <li>Savings balance at the end of the period</li>
          <li>Contributions table: month, member, amount, method, reference, status</li>
          <li>Loans table: principal, balance, monthly repayment, next due date, status</li>
          <li>Meeting log with attendance counts</li>
          <li>Dividend calculation worked line by line</li>
          <li>Member contribution record with months paid</li>
        </ul>
      </section>
    </div>
  );
}
