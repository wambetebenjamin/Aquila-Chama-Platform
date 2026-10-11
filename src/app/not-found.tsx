import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import NotFoundSearch from "@/components/site/NotFoundSearch";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * 404 — not present in the design source, built to the brief:
 * "This page could not be found." + Return to Homepage + a search bar.
 */
export default function NotFound() {
  return (
    <main
      className="site-section"
      style={{ paddingTop: 140, minHeight: "70vh", textAlign: "center" }}
    >
      <div className="container">
        <p
          style={{
            fontSize: "clamp(3rem, 10vw, 6rem)",
            fontWeight: 900,
            color: "var(--color-primary)",
            lineHeight: 1,
            margin: 0,
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, marginTop: "1rem" }}>
          This page could not be found.
        </h1>
        <p className="lead mx-auto" style={{ color: "var(--color-body)", maxWidth: 560 }}>
          The link may be old, or the page may have moved. Search the platform
          below, or head back to the homepage.
        </p>

        <Link href="/" className="btn btn-primary mt-2">
          <Home size={18} aria-hidden="true" />
          Return to Homepage
        </Link>

        <div className="mt-12">
          <NotFoundSearch />
        </div>

        <p className="mt-12" style={{ fontSize: "var(--text-meta)" }}>
          Still stuck? Message us on{" "}
          <a href={site.whatsappRegisterUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            WhatsApp {site.phone}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
