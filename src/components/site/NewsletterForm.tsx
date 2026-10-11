"use client";

import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "./CaptchaChallenge";

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  async function submit(tokenOverride?: string) {
    if (!email) {
      setStatus("error");
      setMessage("Enter your email address first.");
      return;
    }
    setStatus("sending");
    setMessage("");

    const captchaToken =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("newsletter"));

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
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
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className={dark ? "footer-subscribe" : undefined}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
          aria-label="Email address"
          className={
            dark
              ? "form-control border-secondary text-white"
              : "form-control"
          }
          style={
            dark
              ? { background: "transparent", color: "var(--color-white)" }
              : undefined
          }
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className={dark ? "btn btn-primary" : "btn btn-primary"}
          style={dark ? { color: "var(--color-black)" } : undefined}
        >
          {status === "sending" ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Send size={18} aria-hidden="true" />
          )}
          {status === "sending" ? "Sending" : "Send"}
        </button>
      </div>

      {challenge && (
        <div style={{ marginTop: "0.75rem" }}>
          <CaptchaChallenge
            onVerify={(token) => {
              if (!token) return;
              v2TokenRef.current = token;
              void submit(token);
            }}
          />
        </div>
      )}

      {message && (
        <p
          role="status"
          style={{
            margin: "0.75rem 0 0",
            fontSize: "var(--text-meta)",
            color:
              status === "error"
                ? dark
                  ? "#ffb3b3"
                  : "var(--color-danger)"
                : dark
                  ? "rgba(255,255,255,.85)"
                  : "var(--color-success)",
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
