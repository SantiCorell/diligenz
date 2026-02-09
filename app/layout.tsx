import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ===================== */
/* SEO & METADATA GLOBAL */
/* ===================== */
export const metadata: Metadata = {
  title: {
    default: "DILIGENZ | Compra, vende y valora empresas",
    template: "%s | DILIGENZ",
  },
  icons: {
    icon: "/icon.png",
  },
  description:
    "Marketplace para comprar y vender empresas de forma privada y segura. Obtén una valoración orientativa de tu empresa en minutos y conecta con inversores verificados.",
  keywords: [
    "comprar empresas",
    "vender empresa",
    "valorar empresa",
    "valoración de empresas",
    "marketplace de empresas",
    "venta de negocios",
    "inversores privados",
    "due diligence",
  ],
  metadataBase: new URL("https://www.diligenz.es"),
  openGraph: {
    title: "DILIGENZ | Compra, vende y valora empresas",
    description:
      "Compra y vende empresas de forma privada. Valora tu empresa en minutos y conecta con inversores verificados.",
    url: "https://www.diligenz.es",
    siteName: "DILIGENZ",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DILIGENZ | Compra, vende y valora empresas",
    description:
      "Marketplace para comprar, vender y valorar empresas en minutos.",
  },
  robots: {
    index: true,
    follow: true,
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
  return (
    <html lang="es">
      <head>
        {/* ===================== */}
        {/* STRUCTURED DATA (JSON-LD) */}
        {/* ===================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Marketplace",
              name: "DILIGENZ",
              description:
                "Marketplace para comprar, vender y valorar empresas de forma privada y segura.",
              url: "https://www.diligenz.es",
              areaServed: "ES",
              potentialAction: [
                {
                  "@type": "SearchAction",
                  target: "https://www.diligenz.es/companies",
                  "query-input": "required name=search_term_string",
                },
              ],
            }),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--brand-bg)] text-[var(--foreground)]`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
