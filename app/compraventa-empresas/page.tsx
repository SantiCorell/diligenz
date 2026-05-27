import type { Metadata } from "next";
import SeoLanding from "@/components/seo/SeoLanding";
import { COMPRAVENTA_EMPRESAS_LANDING } from "@/lib/seo-landings";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Compraventa de Empresas | Marketplace Diligenz",
  description:
    "Guía y plataforma de compraventa de empresas en España. Venta total, parcial o por jubilación. Valoración, due diligence y cierre seguro con Diligenz.",
  keywords: [
    "compraventa de empresas",
    "compraventa de pymes",
    "M&A España",
    "marketplace empresas",
    "fusiones y adquisiciones",
  ],
  openGraph: {
    title: `Compraventa de Empresas | ${SITE_NAME}`,
    description:
      "Marketplace M&A para comprar y vender empresas en España. Proceso completo con asesoramiento profesional.",
    url: `${SITE_URL}/compraventa-empresas`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/compraventa-empresas` },
};

export default function CompraventaEmpresasPage() {
  return <SeoLanding config={COMPRAVENTA_EMPRESAS_LANDING} />;
}
