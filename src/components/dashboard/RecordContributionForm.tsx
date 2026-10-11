"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "@/components/site/CaptchaChallenge";

export interface MemberOption {
  id: string;
  name: string;
}

const METHODS = ["MPESA", "BANK", "CASH"] as const;

export default function RecordContributionForm({
  members,
  defaultAmount,
  months,
}: {
  members: MemberOption[];
  defaultAmount: number;
  months: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    memberId: members[0]?.id ?? "",
    amount: String(defaultAmount),
    month: months[months.length - 1] ?? "",
    method: "MPESA" as (typeof METHODS)[number],
    reference: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  async function submit(tokenOverride?: string) {
    setStatus("sending");
    setMessage("");

    const captchaToken =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("contribution_submit"));

    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
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
      setForm((prev) => ({ ...prev, reference: "" }));
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not record the contribution. Please try again.");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <label className="form-label" htmlFor="con-member">
          Member
        </label>
        <select
          id="con-member"
          className="form-control"
          value={form.memberId}
          onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))}
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="con-amount">
          Amount (KES)
        </label>
        <input
          id="con-amount"
          type="number"
          min={1}
          className="form-control"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="form-label" htmlFor="con-month">
          Month
        </label>
        <select
          id="con-month"
          className="form-control"
          value={form.month}
          onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="con-method">
          Payment method
        </label>
        <select
          id="con-method"
          className="form-control"
          value={form.method}
          onChange={(e) =>
            setForm((p) => ({ ...p, method: e.target.value as (typeof METHODS)[number] }))
          }
        >
          {METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="form-label" htmlFor="con-reference">
          M-Pesa reference
        </label>
        <input
          id="con-reference"
          className="form-control"
          value={form.reference}
          onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
          placeholder="QGH7X2K9LM"
          required
        />
      </div>

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

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Wallet size={18} aria-hidden="true" />
          )}
          {status === "sending" ? "Recording" : "Record contribution"}
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
  );
}
