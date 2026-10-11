import Link from "next/link";
import { legalLinks } from "@/lib/site";

/**
 * Legal page shell: source-derived typography (.site-section, .section-title),
 * a sticky table of contents on desktop and a single column on mobile.
 */
export default function LegalLayout({
  title,
  subtitle,
  updated,
  sections,
  children,
}: {
  title: string;
  subtitle: string;
  updated: string;
  sections: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <section className="site-section" style={{ paddingTop: 160 }}>
      <div className="container">
        <div className="mb-10 max-w-3xl">
          <span className="section-sub-title">Legal</span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.15 }}>
            {title}
          </h1>
          <p className="lead" style={{ color: "var(--color-body)" }}>
            {subtitle}
          </p>
          <p className="post-meta">Last updated {updated}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div
              className="sticky rounded p-4"
              style={{
                top: 120,
                background: "var(--color-light)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-meta)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  color: "var(--color-black)",
                }}
              >
                On this page
              </p>
              <ul className="list-none p-0">
                {sections.map((s) => (
                  <li key={s.id} style={{ marginBottom: "0.5rem" }}>
                    <a href={`#${s.id}`} style={{ fontSize: "15px" }}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>

              <hr style={{ margin: "1rem 0", borderColor: "var(--color-border)" }} />

              <p
                style={{
                  fontSize: "var(--text-meta)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  color: "var(--color-black)",
                }}
              >
                Other policies
              </p>
              <ul className="list-none p-0">
                {legalLinks.map((l) => (
                  <li key={l.href} style={{ marginBottom: "0.5rem" }}>
                    <Link href={l.href} style={{ fontSize: "15px" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="prose-legal" style={{ maxWidth: 760 }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
