"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import CaptchaChallenge from "@/components/site/CaptchaChallenge";

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 160 }} />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const [challenge, setChallenge] = useState(false);
  const v2TokenRef = useRef<string | null>(null);

  async function submit(tokenOverride?: string) {
    setStatus("sending");
    setMessage("");

    const token =
      tokenOverride ?? v2TokenRef.current ?? (await executeRecaptcha("login"));

    const check = await fetch("/api/captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "login" }),
    });
    const checkJson = (await check.json()) as {
      ok: boolean;
      challengeRequired?: boolean;
    };

    if (!checkJson.ok) {
      if (checkJson.challengeRequired && !v2TokenRef.current) setChallenge(true);
      setStatus("error");
      setMessage("Security check failed. Please complete the challenge and try again.");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setStatus("error");
      setMessage("Those credentials did not match an account.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <section className="site-section" style={{ paddingTop: 160 }}>
      <div className="container">
        <div className="mx-auto" style={{ maxWidth: 460 }}>
          <span className="section-sub-title">Sign in</span>
          <h1 className="section-title">Your chama dashboard</h1>
          <p style={{ color: "var(--color-body)" }}>
            Admins, treasurers and members sign in here. Every action is written
            to your group&apos;s audit trail.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="bg-white"
            style={{
              padding: "2rem",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-card-sm)",
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {challenge && (
              <div className="mb-3">
                <CaptchaChallenge
                  onVerify={(token) => {
                    if (!token) return;
                    v2TokenRef.current = token;
                    void submit(token);
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <LogIn size={18} aria-hidden="true" />
              )}
              {status === "sending" ? "Signing in" : "Sign In"}
            </button>

            {message && (
              <p role="alert" className="form-error" style={{ marginTop: "0.75rem" }}>
                {message}
              </p>
            )}
          </form>

          <div
            className="mt-6 rounded p-4"
            style={{ background: "var(--color-light)", border: "1px solid var(--color-border)" }}
          >
            <p style={{ margin: 0, fontSize: "var(--text-meta)", fontWeight: 700 }}>
              Demo accounts
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "13px", color: "var(--color-gray-700)" }}>
              Admin: admin@maendeleo.co.ke / aquila-admin-2026
              <br />
              Treasurer: treasurer@maendeleo.co.ke / aquila-treasurer-2026
              <br />
              Member: member@maendeleo.co.ke / aquila-member-2026
            </p>
          </div>

          <p className="mt-6" style={{ fontSize: "var(--text-meta)" }}>
            No account yet?{" "}
            <Link href="/#register" className="text-primary underline">
              Register your chama
            </Link>{" "}
            or try the{" "}
            <Link href="/demo" className="text-primary underline">
              public demo
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
