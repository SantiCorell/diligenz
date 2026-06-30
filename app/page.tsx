import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import Hero from "@/components/home/Hero";
import WhatIsDiligenz from "@/components/home/WhatIsDiligenz";
import StatsSection from "@/components/home/StatsSection";
import FeaturedCompanies from "@/components/companies/FeaturedCompanies";
import ValuationCTA from "@/components/home/ValuationCTA";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCTA from "@/components/home/FinalCTA";
import SpecializedSectors from "@/components/home/SpecializedSectors";
import HomeFAQ from "@/components/home/HomeFAQ";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, getFAQSchema } from "@/lib/seo";

/** Empresas destacadas y datos del marketplace deben leerse en cada visita, no en el build. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: `${SITE_NAME} | Marketplace líder en España para comprar y vender empresas`,
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "comprar empresas España",
    "vender empresa España",
    "marketplace empresas España",
    "venta de empresas en España",
    "valorar empresa España",
    "M&A España",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    type: "website",
    title: `${SITE_NAME} | Líder en España — Compra, vende y valora empresas`,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function HomePage() {
  const faqSchema = getFAQSchema();

  return (
    <ShellLayout homeHero={<Hero />}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <WhatIsDiligenz />
      <StatsSection />
      <SpecializedSectors />
      <FeaturedCompanies />
      <ValuationCTA />
      <HowItWorks />
      <FinalCTA />
      <HomeFAQ />
    </ShellLayout>
  );
}
