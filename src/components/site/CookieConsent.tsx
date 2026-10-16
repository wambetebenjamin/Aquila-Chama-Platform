"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useConsentStore } from "@/store/consent";

/**
 * Cookie consent banner — not present in the design source, built to the brief's
 * fallback spec: fixed to the bottom, full width, above all content, consent
 * stored in localStorage, never shown again once a choice is made.
 */

export default function CookieConsent() {
  const decided = useConsentStore((s) => s.decided);
  const functional = useConsentStore((s) => s.functional);
  const analytics = useConsentStore((s) => s.analytics);
  const acceptAll = useConsentStore((s) => s.acceptAll);
  const save = useConsentStore((s) => s.save);

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftFunctional, setDraftFunctional] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);

  // zustand/persist reads localStorage, which the server does not have.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setDraftFunctional(functional);
    setDraftAnalytics(analytics);
  }, [functional, analytics, modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  if (!mounted || decided) return null;

  return (
    <>
      <section
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-[9500] border-t bg-white"
        style={{
          borderTop: "1px solid var(--color-border)",
          boxShadow: "0 -10px 30px -18px rgba(0,0,0,.35)",
        }}
      >
        <div className="container py-4">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <p
              className="flex items-start gap-3"
              style={{ fontSize: "15px", color: "var(--color-gray-700)", margin: 0, maxWidth: "720px" }}
            >
              <Cookie
                size={22}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-primary"
              />
              <span>
                Aquila Chama Platform uses cookies to remember your group
                preferences and improve your experience. See our{" "}
                <Link
                  href="/legal/cookie-policy"
                  className="text-primary underline"
                >
                  Cookie Policy
                </Link>
                .
              </span>
            </p>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row md:shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn btn-outline-primary"
              >
                Manage Preferences
              </button>
              <button type="button" onClick={acceptAll} className="btn btn-primary">
                Accept All
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[9600] grid place-items-center p-4"
          style={{ background: "rgba(0,0,0,.6)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
        >
          <div
            className="card-surface w-full"
            style={{ maxWidth: 560, padding: "1.5rem" }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id="cookie-preferences-title" className="h4 mb-0">
                Manage cookie preferences
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close cookie preferences"
                className="text-gray-600 hover:text-black"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Toggle
                label="Necessary cookies"
                description="Required for sign in, session security and remembering your group. These cannot be switched off."
                checked
                locked
                onChange={() => undefined}
              />
              <Toggle
                label="Functional cookies"
                description="Remember your contribution filters, dashboard tab and display preferences between visits."
                checked={draftFunctional}
                onChange={setDraftFunctional}
              />
              <Toggle
                label="Analytics cookies"
                description="Help us understand which pages chama treasurers use most so we can improve them. Aggregated and never sold."
                checked={draftAnalytics}
                onChange={setDraftAnalytics}
              />
            </div>

            <p
              className="mt-4"
              style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}
            >
              You can change your choices at any time. Aquila Chama Platform
              processes personal data in line with the Kenya Data Protection Act
              2019. Read our{" "}
              <Link href="/legal/privacy-policy" className="text-primary underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/legal/cookie-policy" className="text-primary underline">
                Cookie Policy
              </Link>
              .
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  setDraftFunctional(false);
                  setDraftAnalytics(false);
                  save({ functional: false, analytics: false });
                }}
              >
                Necessary only
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  save({
                    functional: draftFunctional,
                    analytics: draftAnalytics,
                  });
                  setModalOpen(false);
                }}
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({
  label,
  description,
  checked,
  locked = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--color-black)", fontSize: "15px" }}>
          {label}
          {locked && (
            <span
              className="badge badge-muted"
              style={{ marginLeft: "0.5rem", letterSpacing: "0.06em" }}
            >
              Always on
            </span>
          )}
        </p>
        <p style={{ margin: "0.25rem 0 0", fontSize: "13px", color: "var(--color-gray-600)" }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={locked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 rounded-full transition-colors"
        style={{
          width: 48,
          height: 28,
          minHeight: 28,
          background: checked ? "var(--color-primary)" : "var(--color-gray-300)",
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.75 : 1,
        }}
      >
        <span
          className="absolute rounded-full bg-white transition-all"
          style={{
            width: 20,
            height: 20,
            top: 4,
            left: checked ? 24 : 4,
            boxShadow: "0 1px 2px rgba(0,0,0,.25)",
          }}
        />
      </button>
    </div>
  );
}
