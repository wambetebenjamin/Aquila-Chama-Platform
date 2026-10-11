import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsent from "@/components/site/CookieConsent";
import LoadingScreen from "@/components/site/LoadingScreen";
import VoiceTour from "@/components/site/VoiceTour";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { site } from "@/lib/site";

/**
 * Typography comes from the design source:
 * index.html:8  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700">
 * A <link> is used rather than next/font/google because next/font downloads at
 * build time and this build environment has no egress to fonts.googleapis.com.
 * The browser fetches it at runtime, exactly as the source does.
 */

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": `${site.url}/#organization`,
      name: site.name,
      description: site.description,
      url: site.url,
      telephone: site.phone,
      email: site.email,
      areaServed: { "@type": "Country", name: "Kenya" },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Aquila House, 3rd Floor, Ngong Road",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      serviceType: [
        "Chama contribution management",
        "Table banking",
        "Investment group management",
        "Savings group reporting",
      ],
      knowsAbout: [
        "chama management",
        "table banking",
        "rotating savings and credit associations",
        "cooperative finance",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Finance",
      operatingSystem: "Web browser",
      url: site.url,
      description: site.description,
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "0",
          priceCurrency: "KES",
          description: "Free for groups of up to 20 members",
        },
        {
          "@type": "Offer",
          name: "Growth",
          price: "999",
          priceCurrency: "KES",
          description: "Up to 100 members, billed monthly",
        },
        {
          "@type": "Offer",
          name: "Enterprise",
          price: "2999",
          priceCurrency: "KES",
          description: "Unlimited members, billed monthly",
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Aquila Chama Platform | Chama and table banking management in Kenya",
    template: "%s | Aquila Chama Platform",
  },
  description: site.description,
  keywords: [
    "chama management Kenya",
    "table banking software",
    "savings group app Kenya",
    "investment group management",
    "chama contributions",
    "chama loans",
    "sacco sub-group",
    "M-Pesa chama records",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: site.url,
    siteName: site.name,
    title: "Your Chama. Managed Properly. Finally.",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Chama. Managed Properly. Finally.",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#007bff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Source typography: Open Sans 300, 400, 700 */}
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700"
          rel="stylesheet"
        />
        {/* Icon fonts shipped with the design source */}
        <link rel="stylesheet" href="/fonts/icomoon/style.css" />
        <link rel="stylesheet" href="/fonts/flaticon/font/flaticon.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LoadingScreen />
        {children}
        <WhatsAppButton />
        <VoiceTour />
        <CookieConsent />
      </body>
    </html>
  );
}
