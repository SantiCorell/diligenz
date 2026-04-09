import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";

import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Política de cookies | ${SITE_NAME}`,
  description:
    "Cookies en Diligenz: tipos, finalidad, base legal, plazo de conservación y cómo ejercer tus derechos (LSSI-CE y RGPD).",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/politica-cookies` },
  openGraph: { url: `${SITE_URL}/politica-cookies`, type: "website" },
};

export default function PoliticaCookiesPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-10 shadow-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--brand-primary)]">
              Política de cookies
            </h1>
            <p className="mt-2 text-sm text-[var(--foreground)] opacity-75">
              Última actualización: abril de 2026 · Titular: Diligenz
            </p>

            <div className="mt-8 space-y-8 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  1. ¿Qué son las cookies y tecnologías similares?
                </h2>
                <p>
                  Las <strong>cookies</strong> son pequeños archivos que se almacenan en tu
                  dispositivo cuando visitas un sitio web. También podemos referirnos a tecnologías
                  afines (p. ej. <em>local storage</em> del navegador) cuando sirven a finalidades
                  equivalentes y están sujetas a las mismas reglas de transparencia y, en su caso,
                  consentimiento.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  2. Responsable y normativa
                </h2>
                <p>
                  El uso de cookies en este sitio se ajusta a la <strong>Ley 34/2002 (LSSI-CE)</strong>
                  , al <strong>RGPD</strong> y a la legislación española de protección de datos. Las
                  cookies <strong>estrictamente necesarias</strong> pueden instalarse sin
                  consentimiento previo. Las de análisis, preferencias no esenciales o publicidad
                  requieren <strong>consentimiento informado</strong>, que gestionamos mediante el
                  banner de cookies y el almacenamiento local bajo la clave técnica indicada en ese
                  banner.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  3. Cookies y almacenamiento que utilizamos
                </h2>
                <p className="mb-4">
                  La siguiente tabla resume las principales categorías aplicables a{" "}
                  <strong>{SITE_NAME}</strong>. Los nombres exactos pueden variar ligeramente según
                  despliegue (dominio, prefijos).
                </p>
                <div className="overflow-x-auto rounded-xl border border-[var(--brand-primary)]/15">
                  <table className="min-w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Nombre / clave</th>
                        <th className="px-3 py-2.5 font-semibold">Tipo</th>
                        <th className="px-3 py-2.5 font-semibold">Finalidad</th>
                        <th className="px-3 py-2.5 font-semibold">Duración orientativa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--brand-primary)]/10">
                      <tr className="bg-white">
                        <td className="px-3 py-2.5 font-mono text-[11px] sm:text-xs">session</td>
                        <td className="px-3 py-2.5">Necesaria (HTTP cookie)</td>
                        <td className="px-3 py-2.5">
                          Mantener la sesión iniciada tras el login seguro.
                        </td>
                        <td className="px-3 py-2.5">Sesión / según configuración del servidor</td>
                      </tr>
                      <tr className="bg-[var(--brand-bg)]/40">
                        <td className="px-3 py-2.5 font-mono text-[11px] sm:text-xs">
                          authjs.* / NextAuth
                        </td>
                        <td className="px-3 py-2.5">Necesaria (si OAuth activo)</td>
                        <td className="px-3 py-2.5">
                          Flujo de autenticación con proveedor externo.
                        </td>
                        <td className="px-3 py-2.5">Según proveedor y sesión</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-3 py-2.5 font-mono text-[11px] sm:text-xs">
                          diligenz_cookie_consent_v1
                        </td>
                        <td className="px-3 py-2.5">Preferencia (localStorage)</td>
                        <td className="px-3 py-2.5">
                          Guardar tu elección del banner (necesarias vs. todas, incl. analítica).
                        </td>
                        <td className="px-3 py-2.5">Hasta que borres datos del sitio o revoques</td>
                      </tr>
                      <tr className="bg-[var(--brand-bg)]/40">
                        <td className="px-3 py-2.5">Vercel Speed Insights</td>
                        <td className="px-3 py-2.5">Análisis / rendimiento</td>
                        <td className="px-3 py-2.5">
                          Métricas agregadas de rendimiento (solo si aceptas &quot;Aceptar
                          todas&quot;).
                        </td>
                        <td className="px-3 py-2.5">Según Vercel / política del proveedor</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  4. Cómo damos cumplimiento al consentimiento
                </h2>
                <p>
                  Al entrar en el sitio aparece una <strong>barra fija en la parte inferior</strong>{" "}
                  hasta que eliges <strong>&quot;Solo necesarias&quot;</strong> o{" "}
                  <strong>&quot;Aceptar todas&quot;</strong>. Hasta entonces no activamos herramientas
                  de medición opcionales (p. ej. Speed Insights). Puedes revisar o cambiar tu
                  decisión desde el pie de página: <strong>Configuración de cookies</strong>, que
                  vuelve a mostrar la barra.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  5. Transferencias y terceros
                </h2>
                <p>
                  Si utilizamos proveedores situados fuera del EEE aplicamos las garantías previstas
                  en el RGPD (decisiones de adecuación, cláusulas tipo u otras medidas). Los datos
                  tratados vía cookies analíticas son, en lo posible, de naturaleza agregada o
                  minimizada.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  6. Cómo gestionar cookies en tu navegador
                </h2>
                <p>
                  Puedes bloquear o eliminar cookies desde la configuración de Chrome, Firefox,
                  Safari, Edge, etc. Ten en cuenta que desactivar cookies necesarias puede impedir el
                  inicio de sesión u otras funciones esenciales.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  7. Más información y contacto
                </h2>
                <p>
                  Consulta nuestra{" "}
                  <Link
                    href="/politica-privacidad"
                    className="font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    Política de privacidad
                  </Link>{" "}
                  o escríbenos desde{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    Contacto
                  </Link>
                  . También puedes ejercer los derechos ARCOPLUS cuando correspondan respecto a
                  datos personales asociados al uso del sitio.
                </p>
              </section>
            </div>

            <p className="mt-10 pt-6 border-t border-[var(--brand-primary)]/10 text-sm text-[var(--foreground)] opacity-80">
              <Link href="/" className="text-[var(--brand-primary)] font-medium hover:underline">
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
