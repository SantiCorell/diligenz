import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";

import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Política de privacidad | ${SITE_NAME}`,
  description:
    "Política de privacidad y protección de datos de Diligenz. Cómo tratamos tus datos personales en el marketplace de compraventa de empresas.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/politica-privacidad` },
  openGraph: { url: `${SITE_URL}/politica-privacidad`, type: "website" },
};

export default function PoliticaPrivacidadPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-8 shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
              Política de privacidad
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
              Última actualización: febrero 2025
            </p>

            <div className="mt-6 space-y-5 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                1. Responsable del tratamiento
              </h2>
              <p>
                El responsable del tratamiento de los datos personales que facilite a través de este sitio web o de los servicios de <strong>Diligenz</strong> es la entidad que opera bajo dicha marca. Puede contactar con nosotros a través del formulario de <Link href="/contact" className="text-[var(--brand-primary)] hover:underline">contacto</Link> para cualquier cuestión relacionada con la privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                2. Finalidad y base legal
              </h2>
              <p>
                Tratamos sus datos para: gestionar su registro como usuario, el acceso a la plataforma y la relación contractual; atender sus solicitudes de información, valoración o contacto; enviar comunicaciones comerciales si ha dado su consentimiento; cumplir obligaciones legales; y mejorar nuestros servicios. La base legal es la ejecución del contrato, el consentimiento, el interés legítimo o el cumplimiento legal, según el caso.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                3. Conservación de datos
              </h2>
              <p>
                Conservamos sus datos mientras mantenga una relación con nosotros o sea necesario para la finalidad para la que se recabaron, y posteriormente durante los plazos legalmente exigibles (por ejemplo, obligaciones fiscales o reclamaciones).
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                4. Destinatarios y transferencias
              </h2>
              <p>
                Los datos no se ceden a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio (por ejemplo, proveedores técnicos que actúan como encargados de tratamiento). No realizamos transferencias internacionales fuera del Espacio Económico Europeo salvo las garantías adecuadas (cláusulas tipo, etc.) cuando aplique.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                5. Sus derechos
              </h2>
              <p>
                Puede ejercer sus derechos de acceso, rectificación, supresión, limitación del tratamiento, oposición y portabilidad, así como el derecho a no ser objeto de decisiones individualizadas automatizadas y a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), dirigiéndose a nosotros por el canal de contacto indicado.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                6. Seguridad
              </h2>
              <p>
                Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos frente a accesos no autorizados, pérdida o alteración, en consonancia con la normativa aplicable (Reglamento UE 2016/679 y Ley Orgánica 3/2018 de protección de datos).
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                7. Cambios
              </h2>
              <p>
                Nos reservamos el derecho a actualizar esta política de privacidad. Los cambios relevantes se comunicarán cuando así lo exija la normativa o mediante un aviso en la web.
              </p>
            </section>
            </div>

            <p className="mt-8 pt-5 border-t border-[var(--brand-primary)]/10 text-sm text-[var(--foreground)] opacity-80">
              <Link href="/" className="text-[var(--brand-primary)] hover:underline">← Volver al inicio</Link>
            </p>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
