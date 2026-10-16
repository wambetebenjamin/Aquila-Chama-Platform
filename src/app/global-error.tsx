"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";

/** Last-resort boundary: renders when the root layout itself fails. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[aquila] global error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "'Open Sans', system-ui, sans-serif",
          margin: 0,
          padding: "4rem 1.5rem",
          textAlign: "center",
          color: "#212529",
          background: "#fff",
        }}
      >
        <p style={{ fontSize: "3.5rem", fontWeight: 900, color: "#007bff", margin: 0 }}>
          500
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900 }}>
          Something went wrong on our end.
        </h1>
        <p>Your chama data is safe.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "10px 30px",
            borderRadius: 30,
            border: "none",
            background: "#007bff",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
        <p style={{ marginTop: "2rem", fontSize: 13, color: "#6c757d" }}>
          WhatsApp support: {site.phone}
        </p>
      </body>
    </html>
  );
}
