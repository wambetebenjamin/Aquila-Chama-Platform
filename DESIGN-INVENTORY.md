# Aquila Chama Platform — Source Inventory

**Source of truth:** `finances-master.zip` (uploaded with the brief), unpacked to a scratch
directory outside git. Every value below was read out of that archive — nothing here is guessed.

**Verdict up front:** the zip is a **static Bootstrap 4 marketing template** (Colorlib "Finances",
compiled with Prepros). It contains **no** Next.js app, no `package.json`, no API routes, no env
vars, no cookie banner, no CAPTCHA, no legal pages, no 404, and no 500. Where the zip is silent
this document says `ABSENT` and the build falls back to the fallback spec written in the brief.

---

## 1. Unpacked file tree

```
finances-master/
├── .DS_Store
├── index.html                    1010 lines   marketing landing page
├── single.html                    432 lines   blog detail page
├── prepros-6.config               501 lines   Prepros compiler config (node-sass, autoprefixer, minify)
├── css/
│   ├── style.css                 2098 lines   COMPILED theme (the real source of truth)
│   ├── bootstrap.min.css                      vendor
│   ├── aos.css                                vendor (animate on scroll)
│   ├── owl.carousel.min.css                   vendor (carousel)
│   ├── owl.theme.default.min.css
│   ├── magnific-popup.css
│   ├── jquery.fancybox.min.css
│   ├── jquery-ui.css
│   ├── bootstrap-datepicker.css
│   └── mediaelementplayer.css
├── scss/
│   ├── style.scss                    9 lines   @imports only
│   ├── _site-base.scss             337 lines   base, buttons, forms, sections, footer
│   ├── _site-navbar.scss           424 lines   navbar + mobile offcanvas drawer
│   ├── _site-blocks.scss          1855 lines   every block component
│   └── bootstrap/                             full Bootstrap 4 Sass (functions, variables, mixins)
├── js/
│   ├── main.js                    335 lines   ALL site behaviour
│   ├── jquery-3.3.1.min.js, jquery-ui.js, popper.min.js, bootstrap.min.js
│   ├── owl.carousel.min.js, jquery.countdown.min.js, jquery.easing.1.3.js
│   ├── jquery.fancybox.min.js, jquery.sticky.js, isotope.pkgd.min.js
│   ├── jquery.magnific-popup.min.js, jquery.stellar.min.js, typed.js, slick.min.js
│   └── mediaelement-and-player.min.js, bootstrap-datepicker.min.js
├── fonts/
│   ├── icomoon/                              icon font (4919-line style.css + eot/svg/ttf/woff)
│   └── flaticon/                             icon font (6 glyphs + svg/ttf/woff/woff2/eot)
└── images/
    ├── hero_1.jpg hero_2.jpg about_2.jpg Untitled-8.jpg
    ├── alexander-mils-1469813-unsplash.jpg
    ├── img_1..img_5.jpg  slide_1..slide_3.jpg
    ├── person_1..person_8.jpg
    └── flaticon-svg/svg/{001-wallet,002-rich,003-notes,004-cart,005-megaphone,006-credit-card,007-piggy-bank}.svg
```

**186 files, 21 directories, 8.3 MB.**

---

## 2. Font faces (verbatim)

### 2.1 Web font — the only text font in the source

`index.html` line 8:

```html
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700" rel="stylesheet">
```

**Open Sans, weights 300 / 400 / 700.** No other webfont is loaded.

> Implementation note: `next/font/google` downloads at *build* time and this sandbox cannot reach
> fonts.googleapis.com, so the build would fail. The source's own `<link>` is reproduced verbatim
> in `app/layout.tsx` instead — the browser fetches it, which is exactly what the source does.

### 2.2 `fonts/icomoon/style.css` (lines 1–11)

```css
@font-face {
  font-family: 'icomoon';
  src:  url('fonts/icomoon.eot?10si43');
  src:  url('fonts/icomoon.eot?10si43#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?10si43') format('truetype'),
    url('fonts/icomoon.woff?10si43') format('woff'),
    url('fonts/icomoon.svg?10si43#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
}
```

### 2.3 `fonts/flaticon/font/flaticon.css` (lines 7–29)

```css
@font-face {
  font-family: "Flaticon";
  src: url("./Flaticon.eot");
  src: url("./Flaticon.eot?#iefix") format("embedded-opentype"),
       url("./Flaticon.woff2") format("woff2"),
       url("./Flaticon.woff") format("woff"),
       url("./Flaticon.ttf") format("truetype"),
       url("./Flaticon.svg#Flaticon") format("svg");
  font-weight: normal;
  font-style: normal;
}
@media screen and (-webkit-min-device-pixel-ratio:0) {
  @font-face { font-family: "Flaticon"; src: url("./Flaticon.svg#Flaticon") format("svg"); }
}
```

Both font families are shipped verbatim to `public/fonts/` and linked from `app/layout.tsx`.
Glyphs used by the theme that the build keeps: `\e5ca` (`.ul-check` tick), `\e313` (dropdown caret),
`\f078` (mobile accordion arrow), `\e315` (sub-dropdown caret).
Flaticon glyphs: `\f100` startup, `\f101` graphic-design, `\f102` settings, `\f103` idea,
`\f104` smartphone, `\f105` head.

**Icon policy:** UI icons are Lucide (`lucide-react`) per the brief. The two legacy icon fonts are
preserved so source-derived glyphs (`.ul-check` list ticks) render identically.

---

## 3. Colour tokens

### 3.1 Palette (`scss/bootstrap/_variables.scss`)

| Token | Sass | Hex | Notes |
|---|---|---|---|
| white | `$white` | `#fff` | |
| black | `$black` | `#000` | |
| gray-100 / light | `$gray-100` | `#f8f9fa` | `$light` |
| gray-200 | `$gray-200` | `#e9ecef` | |
| gray-300 | `$gray-300` | `#dee2e6` | `$border-color` |
| gray-400 | `$gray-400` | `#ced4da` | input border |
| gray-500 | `$gray-500` | `#adb5bd` | |
| gray-600 / secondary | `$gray-600` | `#6c757d` | `$secondary` |
| gray-700 | `$gray-700` | `#495057` | |
| gray-800 / dark | `$gray-800` | `#343a40` | `$dark` — footer background |
| gray-900 | `$gray-900` | `#212529` | |
| blue / **primary** | `$blue` | `#007bff` | **theme primary, 40 uses in compiled CSS** |
| green / success | `$green` | `#71bc42` | *overridden from Bootstrap's `#28a745`* |
| cyan / info | `$cyan` | `#17a2b8` | |
| yellow / warning | `$yellow` | `#ffc107` | |
| red / danger | `$red` | `#dc3545` | |
| indigo | `$indigo` | `#6610f2` | unused by theme blocks |
| purple | `$purple` | `#6f42c1` | unused |
| pink | `$pink` | `#e83e8c` | unused |
| orange | `$orange` | `#fd7e14` | unused |
| teal | `$teal` | `#20c997` | unused |

There is **no** `$primary` override anywhere in `scss/*.scss` — primary is plain `#007bff`.

### 3.2 Accent colours found only in `_site-blocks.scss`

| Hex | Where | Use |
|---|---|---|
| `#e81050` | `.cta-big-image .img-box` background | CTA panel |
| `#505288` | `.cta-big-image .img-box .btn` | CTA button |
| `#ccc` | various hairlines (9 uses) | borders |
| `#777` | single use | muted text |
| `#444` | single use | muted text |

### 3.3 Derived values (Sass colour functions, computed exactly)

| Expression | Source | Resolved |
|---|---|---|
| `lighten($black, 50%)` | `body { color }` | `#808080` |
| `lighten($black, 40%)` | `.btn-primary.btn-black--hover:hover` | `#666666` |
| `lighten($black, 80%)` | `.pricing .price > span` | `#cccccc` |
| `darken($primary, 5%)` | `.free-quote` background | `#006fe6` |
| `darken($primary, 7%)` | `.feature-3` background | `#006adb` |
| `darken($primary, 15%)` | `$link-hover-color` | `#0056b2` |
| `lighten($gray-200, 2%)` | dropdown hover | `#eff1f3` |

### 3.4 Alpha layers actually used

`rgba(0,0,0,.7)` hero/cover overlay · `rgba(0,0,0,.8)` (6×) · `rgba(0,0,0,.4)` · `rgba(0,0,0,.3)` ·
`rgba(0,0,0,.2)` offcanvas scrim · `rgba(0,0,0,.1)` shadows · `rgba(0,0,0,.05)`.
White alphas: `.9 .8 .7 .6 .5 .4 .3` and `rgba(255,255,255,.1)` footer top border,
`rgba(255,255,255,.2)` navbar bottom border, `rgba(255,255,255,.5)` icon ring / input border.

---

## 4. Spacing tokens

`$spacer: 1rem` (16px). Bootstrap spacer scale (`_variables.scss` 133–141):

| Step | Value | px |
|---|---|---|
| 0 | `0` | 0 |
| 1 | `$spacer * .25` | 4 |
| 2 | `$spacer * .5` | 8 |
| 3 | `$spacer` | 16 |
| 4 | `$spacer * 1.5` | 24 |
| 5 | `$spacer * 3` | 48 |

Theme-level spacing read out of the SCSS:

| Where | Value |
|---|---|
| `.site-section` | `2.5em 0` → `8em 0` at ≥768px |
| `.site-section-sm` | `4em 0` |
| `.site-footer` | `4em 0` → `8em 0` at ≥768px |
| `.site-section-heading` | `padding-bottom: 20px` |
| `.feature-1` | `padding: 30px 50px` |
| `.pricing` | `padding: 30px` |
| `.btn` | `padding: 10px 30px` |
| `.form-control` | `height: 43px` |
| `.ul-check li` | `padding-left: 35px; margin-bottom: 15px` |
| `.site-footer ul li` | `margin-bottom: 10px` |
| `.site-menu > li > a` | `padding: 20px 20px` |
| dropdown `> li > a` | `padding: 9px 20px` |
| mobile menu `> li > a` | `padding: 10px 20px`, nested `40px`, `60px` |
| `.footer-subscribe .btn` | `height: 43px` |
| `.site-mobile-menu` | `width: 300px`, `padding-top: 20px`, body `padding: 0 20px 20px`, `padding-bottom: 150px`, close `padding-left/right: 20px` |
| `.experience` | `padding: 20px` |
| `.single-text .owl-dots` | `margin-top: 2rem`, dot `margin: 3px` |

---

## 5. Typography

`$font-size-base: 1rem` (16px). Browser default assumed 16px everywhere.

| Element | Size | Weight | Other |
|---|---|---|---|
| body | 16px (1rem) | 400 | `line-height: 1.7`, colour `lighten($black,50%)` = `#808080` |
| h1 / .h1 | 2.5rem = 40px | 500 | `line-height 1.2`, `margin-bottom: .5rem` |
| h2 / .h2 | 2rem = 32px | 500 | |
| h3 / .h3 | 1.75rem = 28px | 500 | |
| h4 / .h4 | 1.5rem = 24px | 500 | |
| h5 / .h5 | 1.25rem = 20px | 500 | |
| h6 / .h6 | 1rem = 16px | 500 | |
| display-1 | 6rem = 96px | 300 | |
| display-2 | 5.5rem = 88px | 300 | |
| display-3 | 4.5rem = 72px | 300 | 3rem below 768px |
| display-4 | 3.5rem = 56px | 300 | |
| `.lead` | 1.25rem = 20px | 300 | |
| `.btn` | **16px** | 400 | radius 30px |
| `.form-control` | 16px | — | height 43px, radius 30px |
| placeholders | **13px** | 200/400 | *italic* |
| `.site-section-heading` | 2.5rem → 3rem ≥768px | — | |
| `.section-title` | **40px** | **900** | colour `$primary` → 30px below 768px |
| `.section-sub-title` | **13px** | — | `letter-spacing: .2em`, uppercase, `$primary` |
| `.site-blocks-cover h1` | **4rem = 64px** | **900** | white → 2rem below 768px |
| `.site-blocks-cover p` | 16px | 300 | `line-height 1.5` |
| `.site-blocks-cover .desc` | 1.4rem = 22.4px | 300 | |
| `.feature-1` | 15px | — | `.heading` 22px uppercase |
| `.feature-1 .icon` | 35px glyph | — | 80×80 circle, 2px ring |
| `.testimonial blockquote` | 1.5rem = 24px | — | *italic* → 1rem below 768px |
| `.pricing .price > span > span` | 3rem = 48px | — | `$primary` |
| `.footer-heading` | **16px** | — | white |
| `.experience .year` | 3rem = 48px | 900 | `letter-spacing: .2em`, `.caption` `.4em` uppercase |
| `.h-entry` meta | 13px | — | (blog card metadata) |
| `.ul-check li:before` | 20px | — | icomoon tick |

**Brief minimums check:** body 16 ≥ 15 ✓ · metadata 13 ≥ 11 ✓ · navigation 16 ≥ 13 ✓ ·
buttons 16 ≥ 12 ✓. The source already clears every minimum in the brief, so **no source value was
changed** — the brief's figures are floors, not overrides.

`::selection` — background `#000`, colour `#fff`.

---

## 6. Shadows

| Token / selector | Value |
|---|---|
| `$box-shadow-sm` | `0 .125rem .25rem rgba(0,0,0,.075)` |
| `$box-shadow` | `0 .5rem 1rem rgba(0,0,0,.15)` |
| `$box-shadow-lg` | `0 1rem 3rem rgba(0,0,0,.175)` |
| **sticky navbar** (`.sticky-wrapper.is-sticky .site-navbar`) | **`4px 0 20px -5px rgba(0,0,0,.1)`** |
| nav dropdown | `0 2px 10px -2px rgba(0,0,0,.1)` |
| mobile drawer | `-10px 0 20px -10px rgba(0,0,0,.1)` |
| `.pricing-popular .pricing` | `0 10px 40px -10px rgba(0,0,0,.3)` |
| `$btn-box-shadow` | `inset 0 1px 0 rgba(255,255,255,.15), 0 1px 1px rgba(0,0,0,.075)` |
| `$btn-active-box-shadow` | `inset 0 3px 5px rgba(0,0,0,.125)` |

---

## 7. Borders & radii

| Token | Value |
|---|---|
| `$border-width` | `1px` |
| `$border-color` | `#dee2e6` (`$gray-300`) |
| `$border-radius` | `.25rem` = 4px |
| `$border-radius-lg` | `.3rem` |
| `$border-radius-sm` | `.2rem` |
| `.btn` radius | **30px** |
| `.form-control` radius | **30px** |
| `.border-2` | `border-width: 2px` |
| `.border-primary:after` | 80px × 3px bar, background `$primary`, centred when `.text-center` |
| navbar bottom border | `1px solid rgba(255,255,255,.2)` — becomes `1px solid transparent` when stuck |
| footer `.border-top` | `1px solid rgba(255,255,255,.1)` |
| `.feature-1 .icon` ring | `2px solid rgba(255,255,255,.5)` |
| `.team-member figure` | `border-color: $primary` |

---

## 8. Motion, z-index, breakpoints

**Transitions:** links `.3s all ease` · navbar `.3s all ease` · mobile drawer `.3s all ease-in-out` ·
offcanvas scrim `.3s all ease-in-out` · buttons `.15s` · owl carousel `smartSpeed: 1000` ·
isotope `0.8s` · AOS `{ duration: 800, easing: 'slide', once: true }`.
(Feature-card hover `250ms ease` is specified by the brief, not the zip — used as given.)

**Z-index:** `#overlayer` **7100** · `.loader` **7700** · `.site-mobile-menu` **2000** ·
`.site-navbar` **1999** · `.sticky-wrapper` 100 · offcanvas scrim 999.

**Breakpoints:** sm 576 · md 768 · lg 992 · xl 1200.
**Containers:** 540 / 720 / 960 / **1140** (xl). **Gutter:** 30px. **Columns:** 12.

---

## 9. Loading screen — PRESENT, copied

`index.html` lines 31–36:

```html
<div id="overlayer"></div>
<div class="loader">
  <div class="spinner-border text-primary" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
```

`scss/_site-blocks.scss` 1810–1832:

```scss
#overlayer { width:100%; height:100%; position:fixed; z-index:7100;
             background: $white; top:0; left:0; right:0; bottom:0; }
.loader    { z-index:7700; position:fixed; top:50%; left:50%;
             transform: translate(-50%, -50%); }
```

`js/main.js` lines 9–10 — **the exact timing**:

```js
$(".loader").delay(1000).fadeOut("slow");
$("#overlayer").delay(1000).fadeOut("slow");
```

1000 ms hold, then jQuery `fadeOut("slow")` = **600 ms** → **1.6 s total**, which satisfies the
brief's "under 2 seconds". Implemented as: hold `max(1000ms, window load)`, 600 ms fade, primary
`#007bff` spinner, white `#fff` overlay, z-index 7700/7100. The brief's extras are layered on top
of the copied behaviour: coin + Aquila wordmark, thin progress bar, `role="status"` announcing
"Platform ready" on completion, plain-text percentage under `prefers-reduced-motion`, and a Skip
control that appears at 3 s **only if the page is still loading** (on a fast connection the
1.6 s sequence finishes first, so it never flashes).

---

## 10. Cookie consent banner — ABSENT

No cookie banner, no consent storage, no `/legal/*` pages anywhere in the zip.
→ Built from the brief's fallback spec, using the source's colour/shadow/radius tokens and the
`.btn` geometry (16px, 30px radius, 10px 30px).

---

## 11. CAPTCHA — ABSENT

No reCAPTCHA script, no site key, no verification endpoint.
→ Built from the brief: reCAPTCHA v3 invisible on all seven named forms, server-side verification
in every API route, score < 0.5 escalates to visible v2, secret env-only.

---

## 12. Legal pages — ABSENT

Zip has **zero** legal content. The only related markup is two footer links in `index.html`
(`Terms`, `Policy`) that both point at `#about-section` — dead anchors, no pages behind them.
→ All three pages built from the brief's section lists.

---

## 13. 404 page — ABSENT · 500 page — ABSENT

The zip ships no `404.html`, no `500.html`, no error markup of any kind.
→ Both built from the brief's exact copy.

---

## 14. API routes — ABSENT

The zip is static HTML. There is no server, no `api/` directory, no fetch calls.
Every route in the build is new, named exactly as the brief lists:

```
/api/register  /api/members  /api/contributions  /api/loans
/api/meetings  /api/reports/generate  /api/reports/deliver
/api/demo      /api/newsletter        /api/contact
/api/captcha   /api/auth/[...nextauth]
```

---

## 15. Environment variables — ABSENT

No `.env`, `.env.example`, or config file references any variable name. All names below come from
the brief plus what the pinned packages require.

```
# Auth
AUTH_SECRET                  NEXTAUTH_SECRET (legacy alias)
NEXTAUTH_URL
AUTH_GOOGLE_ID               GOOGLE_CLIENT_ID  (optional Google provider)
AUTH_GOOGLE_SECRET           GOOGLE_CLIENT_SECRET
DEMO_ADMIN_PASSWORD          DEMO_TREASURER_PASSWORD   DEMO_MEMBER_PASSWORD
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY   RECAPTCHA_SECRET_KEY   RECAPTCHA_MIN_SCORE
# Storage / delivery
KV_REST_API_URL   KV_REST_API_TOKEN   BLOB_READ_WRITE_TOKEN
# Email
SMTP_HOST  SMTP_PORT  SMTP_USER  SMTP_PASS  CONTACT_TO_EMAIL  MAIL_FROM
# WhatsApp Cloud API
WHATSAPP_TOKEN  WHATSAPP_PHONE_NUMBER_ID  WHATSAPP_VERIFY_TOKEN
NEXT_PUBLIC_WHATSAPP_NUMBER
# Site
NEXT_PUBLIC_SITE_URL
```

`RECAPTCHA_SECRET_KEY` is read **server-side only** — never exposed to the client bundle.

---

## 16. Packages — ABSENT

No `package.json` in the zip. Dependency versions are taken verbatim from the brief's stack list.

**One deviation, forced by reality:** `@vercel/blob@0.29.4` **does not exist on npm**
(`npm view @vercel/blob@0.29.4` → 404; newest 0.x is `0.27.3`, latest is `2.8.1`).
Pinned to **`0.27.3`** — the closest published version, same `put/get/list/del` API surface.
Every other version in the brief resolved exactly as written.

`recharts@2.15.3` declares `react ^16 || ^17 || ^18`; it runs fine on React 19 but npm's peer
resolver rejects it, so `.npmrc` sets `legacy-peer-deps=true` to keep `npm install` clean.

---

## 17. Page structure found in `index.html`

| # id | Section | Notes the build reuses |
|---|---|---|
| — | `#overlayer` + `.loader` | loading screen (§9) |
| — | `.site-mobile-menu` | 300px right drawer, `translateX(110%)` → `0` |
| `header.site-navbar.js-sticky-header` | sticky navbar | `.shrink` added past **100px** scroll (`main.js` `siteScroll`) |
| `about-section` | `.site-blocks-cover.overlay` hero | full-bleed image, `rgba(0,0,0,.7)` overlay, `min-height: 600px`, `height: calc(100vh)`, h1 4rem/900 |
| `next` | 3-up icon feature row | `img/flaticon-svg/*`, `h3.card-title` |
| `about-section` (2nd) | `.cta-big-image` | `.img-box` `#e81050`, 550px, padding 3rem, bottom −10% right 10%, button `#505288` |
| `team-section` | team grid | `.person` + social row |
| `gallery-section` | isotope + fancybox gallery | filters, `0.8s` transitions |
| (no id) | How It Works | owl carousel + `.custom-direction` arrows |
| `services-section` | `.bg-light` services grid | `.unit-4` icon + text rows |
| `testimonials-section` | `.testimonial-wrap` `.slide-one-item` | blockquote 1.5rem italic, 100px round avatar |
| `pricing-section` | `.pricing` × 3 | 30px pad, `.pricing-popular` shadow, `.ul-check.success` |
| `faq-section` | FAQ | two-column Q/A |
| `blog-section` | `.h-entry` cards | image → title → `.meta` → excerpt → "Continue Reading..." |
| `contact-section` | contact + `form.p-5.bg-white` | 3-up icon contact row, then the form |
| `footer.site-footer` | footer | `$dark` `#343a40` bg, 3 link columns + `.footer-subscribe` |

`single.html` (blog detail) reuses the same navbar/footer plus: `.breadcrumb-custom` hero,
`.post-meta`, article body, `.categories` / `.sidelink` sidebar, `.comment-list`,
`.comment-form-wrap` (name / email / website / message).

---

## 18. Behaviour inventory (`js/main.js`)

| Behaviour | Implementation detail carried over |
|---|---|
| Loading screen | `.delay(1000).fadeOut("slow")` on `.loader` and `#overlayer` |
| Sticky header | jQuery `sticky({topSpacing:0})` + `.shrink` class past `scrollTop > 100` |
| Mobile menu | clone nav into `.site-mobile-menu-body`, `body.offcanvas-menu` toggles `translateX` |
| Mobile accordion | injected `.arrow-collapse` spans, `#collapseItem{n}` targets |
| Close on resize | removes `offcanvas-menu` above 768px |
| Click-outside | `mouseup` outside `.site-mobile-menu` closes drawer |
| One-page nav | 600 ms `easeInOutExpo` scroll to hash |
| Carousels | `single-text` (autoplay, nav off, smartSpeed 1000), `slide-one-item`, `slide-one-item-alt(-text)` |
| AOS | `duration: 800, easing: 'slide', once: true` |
| Isotope | gallery filter, `itemSelector: '.item'`, `isFitWidth: true` |
| Fancybox | gallery lightbox |
| Datepicker / countdown | present but unused by the landing page |

---

## 19. Images

The zip's own photos (`hero_1/2`, `img_1..5`, `person_1..8`, `slide_1..3`, `about_2`,
`alexander-mils-…unsplash.jpg`) are **generic stock, not East African** — the brief forbids
reusing them for people shots, so they are **not** carried over. The seven flaticon SVGs *are*
carried over to `public/images/flaticon-svg/` as vector assets.

All people photography is freshly sourced and logged in `image-credits.md`.
