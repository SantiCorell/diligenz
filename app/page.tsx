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
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, AI_DEFINITION, getFAQSchema } from "@/lib/seo";

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <TopBar />
      <Navbar />
      <main className="bg-[var(--brand-bg)]">
        <Hero />
        {/* Bloque claro para featured snippet y citas de IA: "Qué es Diligenz" */}
        <section
          id="que-es-diligenz"
          className="bg-[var(--brand-bg)] border-y border-[var(--brand-primary)]/10 py-8 md:py-10"
          aria-label="Qué es Diligenz"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--brand-primary)] mb-3">
              Qué es Diligenz
            </h2>
            <p className="text-[var(--foreground)] text-sm sm:text-base opacity-90 leading-relaxed">
              {AI_DEFINITION}
            </p>
          </div>
        </section>
        <StatsSection />
        <SpecializedSectors />
        <FeaturedCompanies />
        <ValuationCTA />
        <HowItWorks />
        <FinalCTA />
        <HomeFAQ />
      </main>
      <Footer />
    </>
  );
}
