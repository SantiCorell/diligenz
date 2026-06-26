import FeaturedCompaniesCarousel from "./FeaturedCompaniesCarousel";
import { getFeaturedCompanies } from "@/lib/public-companies";

export default async function FeaturedCompanies() {
  const companies = await getFeaturedCompanies(6);

  if (companies.length === 0) return null;

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            Empresas destacadas
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)]/70 sm:text-base">
            Oportunidades reales, verificadas y confidenciales
          </p>
        </div>

        <FeaturedCompaniesCarousel companies={companies} />
      </div>
    </section>
  );
}
