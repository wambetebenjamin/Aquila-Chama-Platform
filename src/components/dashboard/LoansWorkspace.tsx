"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Ban, Check, HandCoins, Loader2, Wallet } from "lucide-react";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "@/components/site/CaptchaChallenge";
import { formatDate, formatKES } from "@/lib/format";
import type { Loan } from "@/lib/types";

export interface LoanView {
  loan: Loan;
  memberName: string;
  guarantorNames: string[];
}

export default function LoansWorkspace({
  loans,
  members,
  viewerMemberId,
  role,
  interestRate,
}: {
  loans: LoanView[];
  members: { id: string; name: string }[];
  viewerMemberId: string;
  role: string;
  interestRate: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; text: string; ok: boolean } | null>(
    null,
  );

  async function vote(loanId: string, decision: "APPROVE" | "REJECT") {
    setBusy(loanId + decision);
    setFeedback(null);
    try {
      const res = await fetch(`/api/loans/${loanId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const json = (await res.json()) as { ok: boolean; message: string };
      setFeedback({ id: loanId, text: json.message, ok: json.ok });
      router.refresh();
    } catch {
      setFeedback({ id: loanId, text: "Could not record your vote.", ok: false });
    } finally {
      setBusy(null);
    }
  }

  async function disburse(loanId: string) {
    setBusy(loanId + "disburse");
    setFeedback(null);
    try {
      const res = await fetch(`/api/loans/${loanId}/disburse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as { ok: boolean; message: string };
      setFeedback({ id: loanId, text: json.message, ok: json.ok });
      router.refresh();
    } catch {
      setFeedback({ id: loanId, text: "Could not disburse the loan.", ok: false });
    } finally {
      setBusy(null);
    }
  }

  async function repay(loanId: string, amount: number, reference: string) {
    setBusy(loanId + "repay");
    setFeedback(null);
    try {
      const res = await fetch(`/api/loans/${loanId}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reference }),
      });
      const json = (await res.json()) as { ok: boolean; message: string };
      setFeedback({ id: loanId, text: json.message, ok: json.ok });
      router.refresh();
    } catch {
      setFeedback({ id: loanId, text: "Could not record the repayment.", ok: false });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6">
      <LoanApplicationForm
        members={members.filter((m) => m.id !== viewerMemberId)}
        interestRate={interestRate}
      />

      <section className="card-surface" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
          Loan book
        </h2>

        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Purpose</th>
                <th scope="col">Principal</th>
                <th scope="col">Balance</th>
                <th scope="col">Monthly</th>
                <th scope="col">Next due</th>
                <th scope="col">Guarantors</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 && (
                <tr>
                  <td colSpan={9}>No loans on record yet.</td>
                </tr>
              )}
              {loans.map(({ loan, memberName, guarantorNames }) => {
                const overdue = loan.status === "OVERDUE";
                const myVote = loan.votes.find((v) => v.guarantorId === viewerMemberId);
                const canVote =
                  loan.status === "AWAITING_GUARANTORS" &&
                  loan.guarantorIds.includes(viewerMemberId);
                const approvals = loan.votes.filter((v) => v.decision === "APPROVE").length;
                const needed = Math.floor(loan.guarantorIds.length / 2) + 1;

                return (
                  <tr
                    key={loan.id}
                    style={
                      overdue
                        ? { background: "rgba(255,193,7,.12)" }
                        : undefined
                    }
                  >
                    <td style={{ fontWeight: 600 }}>{memberName}</td>
                    <td style={{ maxWidth: 220 }}>{loan.purpose}</td>
                    <td>{formatKES(loan.amount)}</td>
                    <td style={{ fontWeight: 600 }}>{formatKES(loan.balance)}</td>
                    <td>{formatKES(loan.monthlyRepayment)}</td>
                    <td style={overdue ? { color: "#8a6100", fontWeight: 700 } : undefined}>
                      {loan.nextDueDate ? formatDate(loan.nextDueDate) : "-"}
                    </td>
                    <td>
                      {guarantorNames.join(", ")}
                      <br />
                      <span style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                        {approvals}/{needed} approved
                        {myVote ? ` · your vote: ${myVote.decision.toLowerCase()}` : ""}
                      </span>
                    </td>
                    <td>
                      <span className={overdue ? "badge badge-warning" : "badge badge-info"}>
                        {loan.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-2">
                        {canVote && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={busy !== null}
                              onClick={() => void vote(loan.id, "APPROVE")}
                            >
                              <Check size={14} aria-hidden="true" />
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={busy !== null}
                              onClick={() => void vote(loan.id, "REJECT")}
                            >
                              <Ban size={14} aria-hidden="true" />
                              Reject
                            </button>
                          </div>
                        )}

                        {role === "ADMIN" && loan.status === "APPROVED" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            disabled={busy !== null}
                            onClick={() => void disburse(loan.id)}
                          >
                            <HandCoins size={14} aria-hidden="true" />
                            {busy === loan.id + "disburse" ? "Disbursing" : "Record disbursement"}
                          </button>
                        )}

                        {(role === "ADMIN" || role === "TREASURER") &&
                          ["DISBURSED", "REPAYING", "OVERDUE"].includes(loan.status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={busy !== null}
                              onClick={() => {
                                const reference = window.prompt(
                                  `Record a repayment for ${memberName}. Enter the M-Pesa reference:`,
                                  "",
                                );
                                if (!reference) return;
                                void repay(loan.id, loan.monthlyRepayment, reference);
                              }}
                            >
                              <Wallet size={14} aria-hidden="true" />
                              Record repayment
                            </button>
                          )}

                        {feedback?.id === loan.id && (
                          <span
                            style={{
                              fontSize: "var(--text-meta)",
                              color: feedback.ok
                                ? "var(--color-success)"
                                : "var(--color-danger)",
                            }}
                          >
                            {feedback.text}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="form-hint mt-3">
          Overdue loans are highlighted in amber. Repayments reduce the running
          balance and move the next due date forward by one month.
        </p>
      </section>
    </div>
  );
}

function LoanApplicationForm({
  members,
  interestRate,
}: {
  members: { id: string; name: string }[];
  interestRate: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: "50000",
    purpose: "",
    termMonths: "12",
    guarantorA: members[0]?.id ?? "",
    guarantorB: members[1]?.id ?? "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  const total =
    Number.parseInt(form.amount || "0", 10) * (1 + interestRate / 100) || 0;
  const monthly = Math.round(total / Math.max(1, Number.parseInt(form.termMonths || "12", 10)));

  async function submit(tokenOverride?: string) {
    setStatus("sending");
    setMessage("");

    if (form.guarantorA === form.guarantorB) {
      setStatus("error");
      setMessage("Choose two different guarantors.");
      return;
    }

    const captchaToken =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("loan_application"));

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseInt(form.amount, 10),
          purpose: form.purpose,
          termMonths: Number.parseInt(form.termMonths, 10),
          guarantorIds: [form.guarantorA, form.guarantorB],
          captchaToken,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        challengeRequired?: boolean;
      };

      if (json.challengeRequired && !v2TokenRef.current) {
        setChallenge(true);
        setStatus("error");
        setMessage("Please complete the security check, then submit again.");
        return;
      }
      if (!json.ok) {
        setStatus("error");
        setMessage(json.message);
        return;
      }

      setStatus("done");
      setMessage(json.message);
      setForm((prev) => ({ ...prev, purpose: "" }));
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not submit the application.");
    }
  }

  return (
    <section className="card-surface" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 0 }}>
        Apply for a loan
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div>
          <label className="form-label" htmlFor="loan-amount">
            Amount (KES)
          </label>
          <input
            id="loan-amount"
            type="number"
            min={1000}
            className="form-control"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="loan-term">
            Term (months)
          </label>
          <input
            id="loan-term"
            type="number"
            min={1}
            max={60}
            className="form-control"
            value={form.termMonths}
            onChange={(e) => setForm((p) => ({ ...p, termMonths: e.target.value }))}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label" htmlFor="loan-purpose">
            Purpose
          </label>
          <input
            id="loan-purpose"
            className="form-control"
            value={form.purpose}
            onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
            placeholder="Restock the wholesale shop before December"
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="loan-guarantor-a">
            Guarantor 1
          </label>
          <select
            id="loan-guarantor-a"
            className="form-control"
            value={form.guarantorA}
            onChange={(e) => setForm((p) => ({ ...p, guarantorA: e.target.value }))}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="loan-guarantor-b">
            Guarantor 2
          </label>
          <select
            id="loan-guarantor-b"
            className="form-control"
            value={form.guarantorB}
            onChange={(e) => setForm((p) => ({ ...p, guarantorB: e.target.value }))}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <p className="form-hint sm:col-span-2" style={{ margin: 0 }}>
          Interest {interestRate}% · total repayable {formatKES(total)} · monthly{" "}
          {formatKES(monthly)}. Both guarantors are notified on WhatsApp the moment
          you submit.
        </p>

        {challenge && (
          <div className="sm:col-span-2">
            <CaptchaChallenge
              onVerify={(token) => {
                if (!token) return;
                v2TokenRef.current = token;
                void submit(token);
              }}
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <HandCoins size={18} aria-hidden="true" />
            )}
            {status === "sending" ? "Submitting" : "Submit application"}
          </button>
        </div>

        {message && (
          <p
            role="status"
            className="sm:col-span-2"
            style={{
              margin: 0,
              fontSize: "var(--text-meta)",
              color: status === "error" ? "var(--color-danger)" : "var(--color-success)",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
