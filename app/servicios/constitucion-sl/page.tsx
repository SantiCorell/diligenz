import type { Metadata } from "next";
import ShellLayout from "@/components/layout/ShellLayout";
import ConstitucionSl from "@/components/servicios/ConstitucionSl";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Constitución exprés de sociedad limitada | ${SITE_NAME}`,
  description:
    "Constitución telemática de su SL a través del CIRCE, con otorgamiento notarial por videoconferencia e inscripción registral. Honorarios cerrados.",
  alternates: { canonical: `${SITE_URL}/servicios/constitucion-sl` },
  openGraph: {
    title: `Constitución exprés de sociedad limitada | ${SITE_NAME}`,
    description:
      "Tramitamos la constitución de su SL de forma telemática, con honorarios cerrados y sin desplazamientos.",
    url: `${SITE_URL}/servicios/constitucion-sl`,
    type: "website",
  },
};

export default function ConstitucionSlPage() {
  return (
    <ShellLayout>
      <ConstitucionSl />
    </ShellLayout>
  );
}
