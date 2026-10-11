"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { navLinks } from "@/lib/site";
import { posts } from "@/lib/blog";

/** Search bar on the 404 page: navigates the whole platform. */
export default function NotFoundSearch() {
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const pages = [
      { label: "Home", href: "/", keywords: "home chama contributions" },
      { label: "Features", href: "/#features", keywords: "features contributions loans voting reports" },
      { label: "How it works", href: "/#how-it-works", keywords: "how it works register steps" },
      { label: "Pricing", href: "/#pricing", keywords: "pricing starter growth enterprise plans" },
      { label: "Live demo", href: "/demo", keywords: "demo maendeleo sample dashboard" },
      { label: "Register your chama", href: "/#register", keywords: "register sign up create chama" },
      { label: "Sign in", href: "/signin", keywords: "sign in login dashboard" },
      { label: "Blog", href: "/blog", keywords: "blog guides table banking" },
      { label: "Contact", href: "/#contact-section", keywords: "contact whatsapp phone email" },
      { label: "Privacy Policy", href: "/legal/privacy-policy", keywords: "privacy data" },
      { label: "Terms of Service", href: "/legal/terms", keywords: "terms conditions" },
      { label: "Cookie Policy", href: "/legal/cookie-policy", keywords: "cookies consent" },
      ...navLinks.map((l) => ({ label: l.label, href: l.href, keywords: l.label })),
    ];

    const articles = posts.map((p) => ({
      label: p.title,
      href: `/blog/${p.slug}`,
      keywords: `${p.category} ${p.excerpt}`,
    }));

    const all = [...pages, ...articles];
    const unique = new Map(all.map((entry) => [entry.href, entry]));
    return Array.from(unique.values());
  }, []);

  const needle = query.trim().toLowerCase();
  const results = needle
    ? entries.filter(
        (e) =>
          e.label.toLowerCase().includes(needle) ||
          e.keywords.toLowerCase().includes(needle),
      )
    : entries.slice(0, 6);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <label className="form-label" htmlFor="site-search">
        Search the platform
      </label>
      <div className="flex gap-2">
        <span className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute"
            style={{ left: 16, top: 13, color: "var(--color-gray-500)" }}
          />
          <input
            id="site-search"
            type="search"
            className="form-control"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Try loans, pricing, table banking..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </span>
      </div>

      <ul className="mt-4 list-none p-0 text-left">
        {results.length === 0 && (
          <li className="form-hint" style={{ padding: "0.5rem 0" }}>
            Nothing matched &quot;{query}&quot;. Try &quot;pricing&quot;,
            &quot;loans&quot; or &quot;table banking&quot;.
          </li>
        )}
        {results.map((r) => (
          <li key={r.href + r.label} style={{ borderBottom: "1px solid var(--color-gray-200)" }}>
            <Link
              href={r.href}
              className="flex items-center justify-between gap-3"
              style={{ padding: "0.875rem 0", fontSize: "15px", color: "var(--color-black)" }}
            >
              {r.label}
              <ArrowRight size={16} className="text-primary" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
