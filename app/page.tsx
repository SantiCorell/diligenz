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

export default function HomePage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <main className="bg-[var(--brand-bg)]">
        <Hero />
        <StatsSection />
        <SpecializedSectors />
        <FeaturedCompanies />
        <ValuationCTA />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
