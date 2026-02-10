import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";

import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Política de cookies | ${SITE_NAME}`,
  description:
    "Información sobre el uso de cookies en el sitio web de Diligenz. Tipos de cookies, finalidad y cómo gestionarlas.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/politica-cookies` },
  openGraph: { url: `${SITE_URL}/politica-cookies`, type: "website" },
};

export default function PoliticaCookiesPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-8 shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
              Política de cookies
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
              Última actualización: febrero 2025
            </p>

            <div className="mt-6 space-y-5 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                1. ¿Qué son las cookies?
              </h2>
              <p>
                Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, tablet, móvil) cuando los visita. Permiten que el sitio recuerde sus preferencias, mantenga la sesión iniciada o analice el uso del sitio, siempre dentro de los límites que indica esta política y la normativa aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                2. ¿Qué cookies utilizamos?
              </h2>
              <p className="mb-3">
                En Diligenz utilizamos cookies con las siguientes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Cookies técnicas o estrictamente necesarias:</strong> son esenciales para el funcionamiento del sitio (por ejemplo, mantener la sesión de usuario, recordar su consentimiento sobre cookies, seguridad). No requieren consentimiento previo.
                </li>
                <li>
                  <strong>Cookies de preferencias:</strong> permiten recordar opciones que ha elegido (idioma, región, etc.) para mejorar su experiencia.
                </li>
                <li>
                  <strong>Cookies de análisis o medición:</strong> nos ayudan a entender cómo se usa la web (páginas visitadas, tiempo de permanencia) de forma agregada y, en su caso, con su consentimiento. Pueden ser propias o de terceros (por ejemplo, Google Analytics), siempre que estén configuradas conforme a la normativa.
                </li>
                <li>
                  <strong>Cookies de marketing (si aplican):</strong> solo se utilizan si usted ha dado su consentimiento, para mostrar publicidad relevante o medir la eficacia de campañas.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                3. Base legal y consentimiento
              </h2>
              <p>
                Las cookies estrictamente necesarias se apoyan en el interés legítimo o en la necesidad de ejecutar el servicio solicitado. El resto de cookies (análisis, marketing, etc.) solo se utilizan tras obtener su consentimiento mediante el banner o panel de cookies que se muestra al acceder al sitio, de conformidad con el artículo 22.2 de la LSSI-CE y el Reglamento General de Protección de Datos (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                4. Cómo gestionar o eliminar cookies
              </h2>
              <p>
                Puede configurar su navegador para bloquear o eliminar cookies. La forma de hacerlo depende del navegador que utilice (Chrome, Firefox, Safari, Edge, etc.). Tenga en cuenta que si desactiva ciertas cookies, algunas funciones del sitio pueden no funcionar correctamente (por ejemplo, mantenerse conectado).
              </p>
              <p className="mt-2">
                También puede revocar o modificar su consentimiento en cualquier momento mediante el enlace o botón de “Configuración de cookies” que ponemos a su disposición en el pie de la web, cuando esté disponible.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--brand-primary)] mb-2">
                5. Más información
              </h2>
              <p>
                Para cualquier duda sobre el uso de cookies o sobre la privacidad de sus datos, puede consultar nuestra <Link href="/politica-privacidad" className="text-[var(--brand-primary)] hover:underline">Política de privacidad</Link> o contactarnos a través del <Link href="/contact" className="text-[var(--brand-primary)] hover:underline">formulario de contacto</Link>.
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
