"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "@/components/site/CaptchaChallenge";

export default function AddMemberForm({ chamaName }: { chamaName: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    idNumber: "",
    joinDate: new Date().toISOString().slice(0, 10),
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function submit(tokenOverride?: string) {
    setStatus("sending");
    setMessage("");

    const captchaToken =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("member_invite"));

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message: string;
        challengeRequired?: boolean;
        inviteLink?: string;
      };

      if (json.challengeRequired && !v2TokenRef.current) {
        setChallenge(true);
        setStatus("error");
        setMessage("Please complete the security check, then add the member again.");
        return;
      }
      if (!json.ok) {
        setStatus("error");
        setMessage(json.message);
        return;
      }

      setStatus("done");
      setMessage(
        json.inviteLink
          ? `${json.message} Open the WhatsApp invite to welcome them.`
          : json.message,
      );
      setForm({ name: "", phone: "", idNumber: "", joinDate: form.joinDate });
      if (json.inviteLink) window.open(json.inviteLink, "_blank", "noopener");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not add the member. Please try again.");
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
        <label className="form-label" htmlFor="member-name">
          Full name
        </label>
        <input
          id="member-name"
          className="form-control"
          value={form.name}
          onChange={update("name")}
          placeholder="Grace Wanjiru"
          required
        />
      </div>
      <div>
        <label className="form-label" htmlFor="member-phone">
          Phone number
        </label>
        <input
          id="member-phone"
          className="form-control"
          value={form.phone}
          onChange={update("phone")}
          placeholder="254712345678"
          required
        />
      </div>
      <div>
        <label className="form-label" htmlFor="member-id">
          ID number
        </label>
        <input
          id="member-id"
          className="form-control"
          value={form.idNumber}
          onChange={update("idNumber")}
          placeholder="33451209"
          required
        />
      </div>
      <div>
        <label className="form-label" htmlFor="member-join">
          Join date
        </label>
        <input
          id="member-join"
          type="date"
          className="form-control"
          value={form.joinDate}
          onChange={update("joinDate")}
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
            <UserPlus size={18} aria-hidden="true" />
          )}
          {status === "sending" ? "Adding" : "Add member"}
        </button>
        <span className="form-hint">They will be added to {chamaName}.</span>
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
