import type { Metadata } from "next";
import SeoLanding from "@/components/seo/SeoLanding";
import { PLATAFORMA_MA_LANDING } from "@/lib/seo-landings";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Plataforma M&A | Compraventa de Empresas Online | Diligenz",
  description:
    "Plataforma M&A online en España: listados verificados, valoración, datos room y asesoramiento. Compra y vende empresas con la tecnología del marketplace líder.",
  keywords: [
    "plataforma M&A",
    "plataforma M&A España",
    "marketplace M&A",
    "compraventa empresas online",
    "fusiones y adquisiciones digital",
  ],
  openGraph: {
    title: `Plataforma M&A | ${SITE_NAME}`,
    description:
      "Compraventa de empresas online con valoración, listados y asesoramiento profesional en España.",
    url: `${SITE_URL}/plataforma-m-a`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/plataforma-m-a` },
};

export default function PlataformaMAPage() {
  return <SeoLanding config={PLATAFORMA_MA_LANDING} />;
}
