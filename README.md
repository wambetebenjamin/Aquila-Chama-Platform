# Aquila Chama Platform

Contribution, loan and report management for Kenyan chamas, table banking groups and
investment clubs — a Next.js marketing site plus an authenticated group dashboard.

- Marketing site: hero, how it works, features, pricing, testimonials, blog, contact, legal
- Public demo dashboard: `/demo` (SSR, dummy "Maendeleo Investment Group")
- Protected dashboard: `/app` (NextAuth, roles Admin / Treasurer / Member)

---

## 1. Source of the design

The layout, components, colour tokens, spacing scale, typography, loading screen, cookie
consent banner, CAPTCHA behaviour, legal page structure, 404/500 messaging, API route names
and package versions were all extracted from the supplied `finances-master.zip`.

- Full extraction notes: **[`DESIGN-INVENTORY.md`](./DESIGN-INVENTORY.md)**
- Photography provenance: **[`image-credits.md`](./image-credits.md)**

Nothing was renamed, redesigned or removed. Every route that existed in the source still
exists; new routes were added on top.

---

## 2. Stack

Pinned to exact versions (no caret, no tilde), as specified:

| Package | Version |
|---|---|
| `next` | 15.3.3 |
| `react` / `react-dom` | 19.1.0 |
| `typescript` | 5.8.3 |
| `tailwindcss` | 4.1.10 |
| `next-auth` | 5.0.0-beta.28 |
| `framer-motion` | 12.18.0 |
| `lucide-react` | 0.523.0 |
| `@vercel/kv` | 3.0.0 |
| `@vercel/blob` | 0.27.3 |
| `nodemailer` | 6.10.1 |
| `react-hook-form` | 7.57.0 |
| `zod` | 3.25.67 |
| `recharts` | 2.15.3 |
| `zustand` | 5.0.6 |
| `jspdf` / `jspdf-autotable` | 3.0.1 / 5.0.2 (report PDFs) |
| `@next/mdx`, `@mdx-js/react`, `@mdx-js/loader` | 15.3.3 / 3.1.0 / 3.1.0 (blog) |

Node: see `.nvmrc` → **24.3.0** (`engines.node >= 24.0.0`).

Two npm-level notes, both recorded inline in the files that need them:

- `.npmrc` sets `legacy-peer-deps=true`: `recharts@2.15.3` declares React 16–18 peers but
  runs correctly on React 19.
- `package.json` pins an `overrides` entry for `motion-dom@12.18.1`: `framer-motion@12.18.0`
  asks for `motion-dom ^12.17.3`, and newer 12.4x releases drop an export it still imports.

---

## 3. Getting started

```bash
nvm use            # 24.3.0
npm install
cp .env.example .env.local   # fill in the values you need
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run fetch:images` | Re-download the Pexels photo set (needs `PEXELS_API_KEY`) |

### Signing in

The credentials provider ships with three seeded demo accounts (override them in `.env.local`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@maendeleo.co.ke` | `aquila-admin-2026` |
| Treasurer | `treasurer@maendeleo.co.ke` | `aquila-treasurer-2026` |
| Member | `member@maendeleo.co.ke` | `aquila-member-2026` |

No external OAuth setup is required to demo the platform. Setting `AUTH_GOOGLE_ID` and
`AUTH_GOOGLE_SECRET` activates Google sign-in automatically.

---

## 4. Routes

### Marketing

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static, ISR 3600 | Hero, how it works, 8 feature cards, pricing + FAQ, testimonials, newsletter, contact |
| `/blog` | Static, ISR 3600 | MDX article index |
| `/blog/[slug]` | SSG, ISR 3600 | 5 articles, per-article OpenGraph image |
| `/legal/privacy-policy`, `/legal/terms`, `/legal/cookie-policy` | Static, ISR 3600 | Shared `LegalLayout`, Kenya Data Protection Act 2019 |
| `/demo` | SSR | Public dashboard for "Maendeleo Investment Group", persistent CTA banner |
| `/signin` | Static | Credentials + optional Google |
| `/sitemap.xml` | Static | Marketing slugs only — `/app` and `/api` excluded |
| `/robots.txt` | Static | Disallows `/app`, `/api/`, `/signin` |

### Dashboard (`/app`) — SSR, `no-store`, behind NextAuth + edge middleware

| Tab | What it does |
|---|---|
| Overview | 4 KPI cards, 12-month savings line chart, contribution donut, activity feed |
| Members | Register with status, paid months, loan balance; add member + WhatsApp invite link; per-member detail page |
| Contributions | Record a contribution, filter by month / member / status, CSV export, outstanding list with one-tap WhatsApp reminder |
| Loans | Apply with two guarantors and live interest / total / monthly figures, guarantor voting, admin disbursement, repayment capture, overdue highlighting |
| Meetings | Schedule, take attendance, save minutes, share minutes on WhatsApp |
| Reports | Date-range report, jsPDF download, WhatsApp / email delivery, schedule monthly delivery |
| Settings | Group profile, monthly amount, meeting day, WhatsApp delivery number, interest rate (Admin only) |

Roles are enforced server-side: Admin, Treasurer and Member see the same shell but different
actions (for example only an Admin can change settings or disburse a loan).

### API

`/api/register`, `/api/members`, `/api/contributions`, `/api/loans`,
`/api/loans/[id]/vote`, `/api/loans/[id]/disburse`, `/api/loans/[id]/repay`,
`/api/meetings`, `/api/reports/generate`, `/api/reports/deliver`, `/api/demo`,
`/api/newsletter`, `/api/contact`, `/api/captcha`, `/api/auth/[...nextauth]`.

Every mutating route verifies reCAPTCHA server-side. `RECAPTCHA_SECRET_KEY` is read only in
process.env on the server and is never exposed to the browser.

---

## 5. Environment variables

Copy `.env.example` to `.env.local`. Groups: site URL, NextAuth (`AUTH_SECRET`), demo
accounts, reCAPTCHA v3 + v2 (`RECAPTCHA_SECRET_KEY` is server-only), Vercel KV, Vercel Blob
(report uploads), SMTP for report delivery, and `PEXELS_API_KEY` for the image script.

With no KV / Blob credentials the platform falls back to the seeded in-memory dataset, so a
fresh clone runs end to end with an empty `.env.local`.

---

## 6. Design tokens

All colours, fonts, spacing, radii, shadows, transitions and typography steps live as CSS
custom properties in `src/app/globals.css` (`@theme` + `:root`), extracted from the source
stylesheet. Type scale floors are enforced there: body ≥ 15px, metadata ≥ 11px, nav 13px,
buttons 12px. Touch targets are ≥ 48px on every interactive control.

Shared component contracts used across the app: `.card-surface`, `.panel`, `.kpi-card`,
`.data-table` inside `.table-scroll`, `.badge-success|warning|danger|info|muted`, `.chip`,
`.form-label`, `.form-control`, `.form-hint`, `.form-error`, `.btn`, `.btn-secondary`,
`.btn-outline-primary`, `.btn-sm`, `.prose-article`, `.prose-legal`, `.site-section`.

---

## 7. Accessibility & motion

- Voice tour: 56×56 floating button, bottom-left, Lucide `volume-2` / `volume-x`, Web Speech
  API at `rate 0.92`, `pitch 1.05`, `lang en-KE`. No autoplay before first interaction; the
  label becomes "Replay tour" after the script ends; pulsing ring and tooltip
  "Hear what this site is about"; aria-label "Site voice tour, click to mute".
- Loading screen: coin drop → spin → wordmark → progress bar, skippable after 3s,
  `role="status"` announcing "Platform ready", under 2s on a warm cache. With
  `prefers-reduced-motion` it degrades to a plain percentage.
- Cookie consent: bottom full-width banner, Accept All, and a Manage Preferences modal with
  Necessary (locked on), Functional and Analytics, persisted in `localStorage`.
- `prefers-reduced-motion: reduce` disables decorative animation globally.

---

## 8. Deployment (Vercel)

`vercel.json` sets the framework, build/install commands, region, HSTS
(`max-age=63072000; includeSubDomains; preload`) plus nosniff / frame / referrer /
permissions / COOP headers, immutable caching for `/images/*` and `/fonts/*`, and
`no-store` + `noindex` for `/app/*`. `middleware.ts` runs on the edge and blocks unauthenticated
access to `/app`.

Add every value from `.env.example` in the Vercel project settings before deploying.
