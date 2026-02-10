import type { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import StatsSection from "@/components/home/StatsSection";
import FeaturedCompanies from "@/components/companies/FeaturedCompanies";
import ValuationCTA from "@/components/home/ValuationCTA";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/layout/Footer";
import SpecializedSectors from "@/components/home/SpecializedSectors";
import HomeFAQ from "@/components/home/HomeFAQ";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, getFAQSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Marketplace líder en España para comprar y vender empresas`,
  description: DEFAULT_DESCRIPTION,
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <TopBar />
      <Navbar />
      <main className="bg-[var(--brand-bg)]">
        <Hero />
        <StatsSection />
        <SpecializedSectors />
        <FeaturedCompanies />
        <ValuationCTA />
        <HowItWorks />
        <HomeFAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
