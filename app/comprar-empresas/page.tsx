import type { Metadata } from "next";
import SeoLanding from "@/components/seo/SeoLanding";
import FeaturedCompanies from "@/components/companies/FeaturedCompanies";
import { COMPRAR_EMPRESAS_LANDING } from "@/lib/seo-landings";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Comprar Empresas | Encuentra las Mejores Oportunidades en España",
  description:
    "Compra empresas y pymes en España. Explora oportunidades verificadas por sector, ubicación y precio. Marketplace M&A líder con due diligence y asesoramiento profesional.",
  keywords: [
    "comprar empresas",
    "compra de empresas",
    "comprar pymes España",
    "empresas en venta",
    "oportunidades inversión España",
  ],
  openGraph: {
    title: `Comprar Empresas en España | ${SITE_NAME}`,
    description:
      "Encuentra empresas en venta verificadas. Filtra por sector y ubicación en el marketplace líder de M&A.",
    url: `${SITE_URL}/comprar-empresas`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/comprar-empresas` },
};

export default function ComprarEmpresasPage() {
  return (
    <SeoLanding config={COMPRAR_EMPRESAS_LANDING}>
      <FeaturedCompanies />
    </SeoLanding>
  );
}
