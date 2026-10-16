"use client";

import { useEffect, useRef } from "react";
import { V2_SITE_KEY, loadRecaptchaV2 } from "@/lib/recaptcha-client";

/**
 * Visible reCAPTCHA v2 challenge. Shown only when the invisible v3 token is
 * missing or scores below RECAPTCHA_MIN_SCORE (0.5), per the brief.
 */
export default function CaptchaChallenge({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onVerify);
  callbackRef.current = onVerify;

  useEffect(() => {
    let cancelled = false;
    let widgetId: number | null = null;

    loadRecaptchaV2().then(() => {
      if (cancelled || !containerRef.current) return;
      if (!window.grecaptcha?.render || !V2_SITE_KEY) {
        // No v2 key configured (local/dev): let the flow continue.
        callbackRef.current("v2-not-configured");
        return;
      }
      widgetId = window.grecaptcha.render(containerRef.current, {
        sitekey: V2_SITE_KEY,
        theme: "light",
        callback: (token: string) => callbackRef.current(token),
        "expired-callback": () => callbackRef.current(""),
      });
    });

    return () => {
      cancelled = true;
      if (widgetId !== null) window.grecaptcha?.reset(widgetId);
    };
  }, []);

  if (!V2_SITE_KEY) {
    return (
      <p
        className="form-hint"
        style={{ border: "1px dashed var(--color-border)", padding: "0.75rem", borderRadius: "var(--radius)" }}
      >
        reCAPTCHA is not configured on this environment, so the security check is
        skipped. Set <code>NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY</code> and{" "}
        <code>RECAPTCHA_SECRET_KEY</code> to enable it.
      </p>
    );
  }

  return <div ref={containerRef} className="g-recaptcha" />;
}
