import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Valorar y vender mi empresa en España | Valoración gratuita | ${SITE_NAME}`,
  description:
    "Valora tu empresa en minutos de forma gratuita. Publica tu empresa en venta en el marketplace líder de España. Diligenz: valoración orientativa, inversores verificados y asesoramiento M&A hasta el cierre.",
  keywords: [
    "valorar empresa gratis",
    "vender mi empresa España",
    "valoración de empresas España",
    "publicar empresa en venta",
    "valoración orientativa empresa",
  ],
  openGraph: {
    title: `Valorar y vender mi empresa | ${SITE_NAME}`,
    description:
      "Valoración gratuita en minutos. Publica tu empresa en el marketplace líder para comprar y vender empresas en España.",
    url: `${SITE_URL}/sell`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/sell` },
};

/**
 * Valora tu empresa: acceso público, sin registro obligatorio.
 * El formulario envía a /api/valuation (crea ValuationLead; si hay sesión también crea Company).
 */
export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
