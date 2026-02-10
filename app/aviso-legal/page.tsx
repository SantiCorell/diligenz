import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";

import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Aviso legal | ${SITE_NAME}`,
  description:
    "Aviso legal y condiciones de uso del sitio web de Diligenz. Datos del responsable y condiciones generales.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/aviso-legal` },
  openGraph: { url: `${SITE_URL}/aviso-legal`, type: "website" },
};

export default function AvisoLegalPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-8 shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
              Aviso legal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
              Última actualización: febrero 2025
            </p>

            <div className="mt-6 space-y-5 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                1. Datos identificativos
              </h2>
              <p>
                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa que el titular de este sitio web es la entidad que opera bajo la marca <strong>Diligenz</strong>, dedicada al asesoramiento y mediación en operaciones de compraventa de empresas y servicios relacionados (valoración, due diligence, etc.).
              </p>
              <p className="mt-2">
                Para cualquier cuestión relacionada con este aviso legal puede dirigirse a través del formulario de <Link href="/contact" className="text-[var(--brand-primary)] hover:underline">contacto</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                2. Objeto y aceptación
              </h2>
              <p>
                El presente aviso legal regula el acceso y uso del sitio web de Diligenz. La navegación y uso de la web implica la aceptación de las presentes condiciones. Si no está de acuerdo con ellas, le rogamos que no utilice el sitio.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                3. Condiciones de uso
              </h2>
              <p>
                El usuario se compromete a hacer un uso lícito y adecuado del sitio y de sus contenidos, de conformidad con la legislación aplicable, la buena fe y el orden público. Queda prohibido utilizar la web de forma que pueda dañar, inutilizar o sobrecargar el servicio, o que perjudique a otros usuarios o a terceros.
              </p>
              <p className="mt-2">
                Los contenidos e información ofrecidos en la web tienen carácter orientativo y no constituyen asesoramiento jurídico, fiscal ni financiero vinculante. Para decisiones concretas se recomienda consultar con profesionales cualificados.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                4. Propiedad intelectual e industrial
              </h2>
              <p>
                Todos los contenidos del sitio (textos, imágenes, logotipos, diseño, código, etc.) son propiedad de Diligenz o de sus licenciantes y están protegidos por la legislación en materia de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o comunicación pública sin autorización previa y por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                5. Enlaces
              </h2>
              <p>
                El sitio puede contener enlaces a páginas de terceros. Diligenz no asume responsabilidad por el contenido o las prácticas de privacidad de sitios externos. La inclusión de enlaces no implica respaldo alguno.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                6. Modificaciones y ley aplicable
              </h2>
              <p>
                Diligenz se reserva el derecho de modificar el presente aviso legal en cualquier momento. La relación con los usuarios se rige por la normativa española aplicable, sometiéndose las partes a los juzgados y tribunales del domicilio del usuario o los que correspondan conforme a ley.
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
