"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loading screen — timing copied from the design source.
 *
 * js/main.js:9-10   $(".loader").delay(1000).fadeOut("slow");
 *                   $("#overlayer").delay(1000).fadeOut("slow");
 * => 1000ms hold + 600ms fade (jQuery "slow") = 1.6s total.
 *
 * The source's own markup is preserved: a white #overlayer (z-index 7100) with
 * a primary-coloured spinner in .loader (z-index 7700). The brief's additions
 * are layered on top: coin drop + wordmark, a thin progress bar, a Skip control
 * that only appears if the page is still loading after 3s, and role="status"
 * announcing "Platform ready".
 */

const HOLD = 1000;
const FADE = 600;
const SKIP_AFTER = 3000;

export default function LoadingScreen() {
  const [mounted, setMounted] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  const barRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setReduced(prefersReduced);

    const start = performance.now();
    let raf = 0;
    let finished = false;
    let pageLoaded = document.readyState === "complete";

    const onLoad = () => {
      pageLoaded = true;
    };
    window.addEventListener("load", onLoad);

    const paint = (pct: number) => {
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      if (textRef.current) textRef.current.textContent = `${Math.round(pct)}%`;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      paint(100);
      setHiding(true);
      window.setTimeout(() => {
        setMounted(false);
        setReady(true);
      }, FADE);
    };

    const tick = () => {
      const elapsed = performance.now() - start;
      if (!finished) {
        paint(Math.min(97, (elapsed / (HOLD + FADE)) * 100));
      }
      if (elapsed >= SKIP_AFTER) setShowSkip(true);
      if (pageLoaded && elapsed >= HOLD) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (!mounted) {
    return (
      <div role="status" aria-live="polite" className="sr-only">
        {ready ? "Platform ready" : ""}
      </div>
    );
  }

  return (
    <>
      <div
        id="overlayer"
        aria-hidden="true"
        style={{
          opacity: hiding ? 0 : 1,
          transition: `opacity ${FADE}ms ease`,
          pointerEvents: hiding ? "none" : "auto",
        }}
      />
      <div
        className="loader"
        style={{
          opacity: hiding ? 0 : 1,
          transition: `opacity ${FADE}ms ease`,
          pointerEvents: hiding ? "none" : "auto",
        }}
      >
        <div className="flex flex-col items-center" style={{ width: 220 }}>
          {/* Coin — drops from the top, lands, spins (source palette: #ffc107 gold) */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={
              reduced
                ? undefined
                : {
                    animation:
                      "aquila-coin-drop 1000ms cubic-bezier(.36,.07,.19,.97) both",
                  }
            }
          >
            <circle cx="32" cy="32" r="30" fill="#ffc107" />
            <circle
              cx="32"
              cy="32"
              r="23"
              fill="none"
              stroke="#343a40"
              strokeWidth="1.5"
              opacity="0.45"
            />
            <text
              x="32"
              y="39"
              textAnchor="middle"
              fontFamily="Open Sans, sans-serif"
              fontSize="17"
              fontWeight="700"
              fill="#343a40"
            >
              KSh
            </text>
          </svg>

          {/* Wordmark */}
          <p
            className="animate-fade-in"
            style={{
              marginTop: "1rem",
              marginBottom: "0.25rem",
              color: "#212529",
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            Aquila Chama
          </p>
          <p
            className="sr-only"
            style={{ fontSize: "var(--text-meta)" }}
          >
            Loading the platform
          </p>

          {/* Thin horizontal progress bar */}
          <div
            style={{
              width: 160,
              height: 3,
              marginTop: "0.75rem",
              background: "#e9ecef",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              ref={barRef}
              style={{
                width: "0%",
                height: "100%",
                background: "#007bff",
                borderRadius: 999,
              }}
            />
          </div>

          {reduced ? (
            <span
              ref={textRef}
              style={{
                marginTop: "0.5rem",
                fontSize: "var(--text-meta)",
                color: "#6c757d",
              }}
            >
              0%
            </span>
          ) : (
            <span ref={textRef} className="sr-only">
              0%
            </span>
          )}

          {showSkip && (
            <button
              type="button"
              onClick={() => {
                setHiding(true);
                window.setTimeout(() => {
                  setMounted(false);
                  setReady(true);
                }, 200);
              }}
              className="btn btn-sm btn-outline-primary"
              style={{ marginTop: "1rem", minHeight: 40 }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {ready ? "Platform ready" : ""}
      </div>
    </>
  );
}
