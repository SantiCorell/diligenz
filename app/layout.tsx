import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  SITE_URL,
  SITE_NAME,
  TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SEO_KEYWORDS,
  getOrganizationSchema,
  getWebSiteSchema,
  getMarketplaceSchema,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE_DEFAULT = `${SITE_NAME} | ${TAGLINE} — Marketplace líder en España`;

/* ===================== */
/* SEO & METADATA GLOBAL */
/* ===================== */
export const metadata: Metadata = {
  title: {
    default: TITLE_DEFAULT,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE_DEFAULT,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Marketplace de compraventa de empresas en España`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo-dili.png", type: "image/png" }],
    apple: [{ url: "/icon-pwa.svg", type: "image/svg+xml" }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
  category: "business",
  other: {
    "geo.region": "ES",
    "theme-color": "#2F175F",
  },
};

/* ===================== */
/* ROOT LAYOUT */
/* ===================== */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No llamamos auth() aquí para no bloquear cada carga (login/register e inicio van más rápidos).
  // La app usa la cookie "session" (login email/contraseña). Si reactivas OAuth (Google), valora
  // llamar auth() solo en un layout que lo necesite (p. ej. rutas protegidas).
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-dili.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-pwa.svg" />
        <meta name="theme-color" content="#2F175F" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="google-site-verification" content="paVL-Zk5dS7LpLeMXgbx5r1rn6bYGD1iWgtg1uJL-ZI" />
        {/* Structured data para buscadores y IA: Organization, WebSite, Marketplace */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebSiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getMarketplaceSchema()),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--brand-bg)] text-[var(--foreground)]`}
        suppressHydrationWarning
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
