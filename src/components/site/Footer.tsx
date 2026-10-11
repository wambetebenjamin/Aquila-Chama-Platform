import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { legalLinks, site } from "@/lib/site";
import NewsletterForm from "./NewsletterForm";

/**
 * Footer — source: `.site-footer`, background $dark #343a40, padding 4em/8em.
 * Single column on mobile (brief), four columns from 768px up.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="footer-heading mb-4">About Us</h2>
            <p>
              Aquila Chama Platform helps savings groups, table banking circles,
              investment clubs and sacco sub-groups across Kenya manage
              contributions, loans, votes and reports in one place.
            </p>
            <p style={{ marginBottom: 0 }}>
              {site.address}
              <br />
              <a href={site.phoneHref}>{site.phone}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>

          <div>
            <h2 className="footer-heading mb-4">Platform</h2>
            <ul className="list-none p-0">
              <li>
                <Link href="/#features">Features</Link>
              </li>
              <li>
                <Link href="/#pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/#how-it-works">How it works</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/demo">Live demo</Link>
              </li>
              <li>
                <Link href="/#contact-section">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading mb-4">Company &amp; Legal</h2>
            <ul className="list-none p-0">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/signin">Sign In</Link>
              </li>
              <li>
                <Link href="/#register">Register your chama</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading mb-4">Subscribe Newsletter</h2>
            <p style={{ fontSize: "var(--text-meta)" }}>
              Monthly chama management tips to your inbox.
            </p>
            <NewsletterForm dark />
            <a
              href={site.whatsappRegisterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2"
              style={{ color: "rgba(255,255,255,.7)", fontSize: "var(--text-meta)" }}
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp {site.phone}
            </a>
          </div>
        </div>

        <div className="mt-12 border-top pt-6 text-center">
          <p style={{ marginBottom: 0 }}>
            Copyright &copy; {new Date().getFullYear()} Aquila Chama Platform.
            All rights reserved. Built in Nairobi for chamas across Kenya.
          </p>
        </div>
      </div>
    </footer>
  );
}
