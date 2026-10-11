"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

/**
 * 500 — not present in the design source, built to the brief:
 * "Something went wrong on our end. Your chama data is safe."
 * Try Again button + WhatsApp support number displayed.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[aquila] unhandled error", error);
  }, [error]);

  return (
    <main
      className="site-section"
      style={{ paddingTop: 140, minHeight: "70vh", textAlign: "center" }}
    >
      <div className="container">
        <span
          className="mx-auto mb-6 grid place-items-center rounded-full text-white"
          style={{
            width: 72,
            height: 72,
            background: "var(--color-primary)",
          }}
          aria-hidden="true"
        >
          <ShieldCheck size={34} />
        </span>

        <p
          style={{
            fontSize: "clamp(3rem, 10vw, 6rem)",
            fontWeight: 900,
            color: "var(--color-primary)",
            lineHeight: 1,
            margin: 0,
          }}
        >
          500
        </p>

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 900,
            marginTop: "1rem",
            maxWidth: 620,
            marginInline: "auto",
          }}
        >
          Something went wrong on our end.
        </h1>
        <p className="lead mx-auto" style={{ color: "var(--color-body)", maxWidth: 560 }}>
          Your chama data is safe.
        </p>
        <p style={{ color: "var(--color-gray-600)", maxWidth: 560, marginInline: "auto" }}>
          Contributions, loans, minutes and reports are stored securely and have
          not been affected. Try again, and if it keeps happening our team will
          pick it up immediately.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary">
            <RefreshCw size={18} aria-hidden="true" />
            Try Again
          </button>
          <Link href="/" className="btn btn-outline-primary">
            Return to Homepage
          </Link>
        </div>

        <div
          className="mx-auto mt-12 rounded p-6 text-left"
          style={{
            maxWidth: 460,
            background: "var(--color-light)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, color: "var(--color-black)" }}>
            WhatsApp support
          </p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "15px", color: "var(--color-gray-700)" }}>
            Fastest way to reach us. Available Monday to Saturday, 8am to 6pm EAT.
          </p>
          <a
            href={site.whatsappRegisterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex font-weight-600"
            style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary)" }}
          >
            {site.phone}
          </a>
          <br />
          <a href={`mailto:${site.email}`} style={{ fontSize: "15px" }}>
            {site.email}
          </a>
        </div>
      </div>
    </main>
  );
}
