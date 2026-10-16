import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Every cookie category used by Aquila Chama Platform, what it does, how long it lasts and how to change your choice.",
  alternates: { canonical: "/legal/cookie-policy" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "necessary", label: "Necessary cookies" },
  { id: "functional", label: "Functional cookies" },
  { id: "analytics", label: "Analytics cookies" },
  { id: "whatsapp-recaptcha", label: "WhatsApp and reCAPTCHA" },
  { id: "manage", label: "Managing your choices" },
  { id: "contact", label: "Contact" },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="A full breakdown of each cookie category, what it stores and how long it lives."
      updated="11 October 2026"
      sections={sections}
    >
      <p>
        We use a small number of cookies and local storage entries. Necessary
        cookies keep you signed in and are always on. Functional and analytics
        cookies only load after you accept them in the banner, and you can change
        your mind at any time.
      </p>

      <h2 id="necessary">Necessary cookies</h2>
      <p>These cannot be switched off because the platform cannot work without them.</p>
      <ul>
        <li>
          <strong>Session and authentication</strong> (NextAuth:{" "}
          <code>authjs.session-token</code>, <code>authjs.csrf-token</code>,
          <code> authjs.callback-url</code>). Keeps an administrator, treasurer or
          member signed in, and protects form submissions against cross-site
          request forgery. Lifetime: session, or 30 days if you tick remember me.
        </li>
        <li>
          <strong>Security and load balancing</strong> (<code>__Host-*</code>).
          Ties your session to a single server during a visit. Lifetime: session.
        </li>
        <li>
          <strong>Consent record</strong> (local storage{" "}
          <code>aquila.cookie-consent</code>). Remembers the choice you made in
          the banner so we do not ask again. Lifetime: until you clear site data.
        </li>
      </ul>

      <h2 id="functional">Functional cookies</h2>
      <p>
        These remember how you like to work. Nothing here is shared with third
        parties.
      </p>
      <ul>
        <li>
          <strong>Dashboard tab</strong> (local storage). Reopens the tab you were
          last on, for example the loans tab in the chama dashboard.
        </li>
        <li>
          <strong>Contribution filters</strong> (local storage). Remembers the
          month, member and status filters you last used.
        </li>
        <li>
          <strong>Voice tour preference</strong> (local storage{" "}
          <code>aquila.voice.muted</code>). Remembers whether you muted the site
          voice tour.
        </li>
        <li>
          <strong>Table and display preferences</strong> (local storage). Column
          order, rows per page, and the collapsed or expanded state of the
          dashboard sidebar.
        </li>
      </ul>
      <p>Lifetime: until you clear site data or withdraw consent.</p>

      <h2 id="analytics">Analytics cookies</h2>
      <p>
        These only load after you accept analytics. They tell us which pages
        treasurers use, where forms are abandoned and how many groups register
        each month. The data is aggregated and never used to profile an
        individual member.
      </p>
      <ul>
        <li>
          <strong>Page and event measurement</strong>. Anonymised page views,
          referring page, device class and country. IP addresses are truncated
          before storage.
        </li>
        <li>
          <strong>Performance timing</strong>. How long the dashboard takes to
          load, so we can make it faster on a Kenyan 3G connection.
        </li>
      </ul>
      <p>Lifetime: up to 13 months, then automatically discarded.</p>

      <h2 id="whatsapp-recaptcha">WhatsApp and reCAPTCHA</h2>
      <p>
        <strong>Google reCAPTCHA</strong> protects every form on the platform
        against automated abuse. The invisible v3 check runs on form submission;
        if its score falls below 0.5 you are asked to complete the visible v2
        challenge. Google sets cookies and processes your interaction under its
        own privacy policy. We never receive your reCAPTCHA secret key in the
        browser, and the secret is held only in our server environment.
      </p>
      <p>
        <strong>WhatsApp links.</strong> Contribution reminders, loan vote
        notifications, meeting minutes and monthly statements are delivered
        through wa.me deep links or the WhatsApp Cloud API. We do not set cookies
        on your behalf; when you follow a link, WhatsApp&apos;s own terms apply.
      </p>

      <h2 id="manage">Managing your choices</h2>
      <ul>
        <li>
          Use <strong>Manage Preferences</strong> in the cookie banner to switch
          functional or analytics cookies on or off at any time.
        </li>
        <li>
          Clearing site data in your browser removes the consent record, and the
          banner appears again on your next visit.
        </li>
        <li>
          Your browser can also block or delete cookies directly, but blocking
          necessary cookies will stop you from signing in.
        </li>
      </ul>
      <p>
        We do not use advertising cookies, we do not sell data, and we do not
        participate in cross-site tracking.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Questions about cookies: <a href={`mailto:${site.email}`}>{site.email}</a>
        <br />
        {site.address}
      </p>
      <p>
        See also the <a href="/legal/privacy-policy">Privacy Policy</a> and the{" "}
        <a href="/legal/terms">Terms of Service</a>.
      </p>
    </LegalLayout>
  );
}
