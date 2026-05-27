import type { Metadata } from "next";
import SeoLanding from "@/components/seo/SeoLanding";
import { VENDER_EMPRESA_LANDING } from "@/lib/seo-landings";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Vender Empresa | Asesoramiento y Plataforma de Compraventa",
  description:
    "Vende tu empresa con confidencialidad en Diligenz. Valoración gratuita, compradores verificados y asesoramiento M&A. Más de 300 empresas en nuestro marketplace.",
  keywords: [
    "vender empresas",
    "vender empresa España",
    "vender mi negocio",
    "venta de pymes",
    "marketplace vender empresa",
  ],
  openGraph: {
    title: `Vender Empresa | ${SITE_NAME}`,
    description:
      "Publica tu empresa, valora en minutos y conecta con inversores. Proceso confidencial con respaldo legal.",
    url: `${SITE_URL}/vender-empresa`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/vender-empresa` },
};

export default function VenderEmpresaPage() {
  return <SeoLanding config={VENDER_EMPRESA_LANDING} />;
}
