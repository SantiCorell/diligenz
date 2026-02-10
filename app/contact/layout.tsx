import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Contacto | ${SITE_NAME}`,
  description:
    "Contacta con Diligenz. Consultas sobre valoración de empresas, compraventa, due diligence y oportunidades de inversión. Respuesta en menos de 24 horas.",
  openGraph: {
    title: `Contacto | ${SITE_NAME}`,
    description:
      "Ponte en contacto con Diligenz. Consultas sobre valoración, compraventa de empresas y due diligence.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
