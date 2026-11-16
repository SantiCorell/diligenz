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
      <div className="relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-10 shadow-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--brand-primary)]">
              Política de cookies
            </h1>
            <p className="mt-2 text-sm text-[var(--foreground)] opacity-75">
              Última actualización: noviembre de 2026 · Titular: Diligenz
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
                        <td className="px-3 py-2.5">Google Tag Manager</td>
                        <td className="px-3 py-2.5">Análisis / medición</td>
                        <td className="px-3 py-2.5">
                          Gestión de etiquetas de medición, solo si aceptas &quot;Aceptar
                          todas&quot;.
                        </td>
                        <td className="px-3 py-2.5">Según Google / política del proveedor</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-3 py-2.5">Google Analytics (GA4)</td>
                        <td className="px-3 py-2.5">Análisis / medición</td>
                        <td className="px-3 py-2.5">
                          Estadísticas agregadas de uso del sitio, solo si aceptas &quot;Aceptar
                          todas&quot;.
                        </td>
                        <td className="px-3 py-2.5">Según Google / política del proveedor</td>
                      </tr>
                      <tr className="bg-[var(--brand-bg)]/40">
                        <td className="px-3 py-2.5">Meta Pixel</td>
                        <td className="px-3 py-2.5">Marketing / medición</td>
                        <td className="px-3 py-2.5">
                          Medición de campañas Meta (Facebook/Instagram) y eventos de conversión,
                          solo si aceptas &quot;Aceptar todas&quot;.
                        </td>
                        <td className="px-3 py-2.5">Según Meta / política del proveedor</td>
                      </tr>
                      <tr className="bg-white">
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
                <p className="mt-4">
                  Las cookies <strong>estrictamente necesarias</strong> no piden consentimiento
                  previo (art. 22.2 de la LSSI): hacen falta para el servicio que solicitas. En
                  Diligenz son la sesión de acceso (<span className="font-mono text-xs">session</span>{" "}
                  y, si el inicio con un proveedor externo está activo, las de autenticación) y el
                  recuerdo de tu propia elección (
                  <span className="font-mono text-xs">diligenz_cookie_consent_v1</span> en
                  localStorage). Esa memoria evita volver a preguntarte en cada página y evita
                  activar la analítica si la has rechazado. No se usan para seguir tu recorrido ni
                  para publicidad.
                </p>
                <p className="mt-3">
                  La medición agregada del apartado 4 no figura en la tabla: no instala cookies ni
                  guarda nada en tu dispositivo.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  4. Medición agregada sin cookies y sin consentimiento
                </h2>
                <p>
                  Para saber qué páginas se piden y si la carga es rápida o lenta, el sitio envía un
                  aviso técnico propio a Diligenz en cada vista de página. No espera a tu elección
                  del banner. <strong>No usa Google Tag Manager</strong> ni ninguna etiqueta de
                  Google o Meta.
                </p>
                <p className="mt-3">
                  Qué se cuenta, solo como totales: la ruta solicitada (sin parámetros de la URL),
                  el día, un tipo de navegación (carga, recarga, atrás o adelante, precarga o cambio
                  interno de página) y un cubo de rendimiento de esa carga (rápida, normal, lenta o
                  desconocido). Cada aviso suma uno a ese total. No guardamos el recorrido de una
                  persona (de una página a la siguiente) ni el tiempo que pasa en cada página.
                </p>
                <p className="mt-3">
                  Qué no se guarda: ninguna cookie de medición, ningún identificador de visitante o
                  de sesión, ninguna dirección IP, ningún user-agent y ningún referrer. No se escribe
                  en localStorage ni en <span className="font-mono text-xs">dataLayer</span>, y el
                  aviso no se reenvía a Google Tag Manager, Google Analytics ni Meta.
                </p>
                <p className="mt-3">
                  Finalidad: conocer la demanda y mejorar el sitio. Base: el contador no es un dato
                  personal, porque no identifica ni permite identificar a una persona, y no es una
                  cookie ni un acceso equivalente al terminal. Por eso no exige consentimiento según
                  el art. 22.2 de la LSSI ni el RGPD. Si eliges «Solo necesarias», esta medición
                  agregada sigue activa y las herramientas de Google y Meta no se cargan.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  5. Analítica y marketing que sí exigen consentimiento
                </h2>
                <p>
                  Google Tag Manager (contenedor GTM-W3SZ2DJH), Google Analytics, Meta Pixel y Vercel
                  Speed Insights <strong>solo se cargan si aceptas la analítica</strong> («Aceptar
                  todas» o «Aceptar analítica» en el recordatorio). Sirven para estadísticas de uso
                  más detalladas y, en el caso de Meta, para medir campañas. Pueden usar cookies o
                  identificadores.
                </p>
                <p className="mt-3">
                  Base legal: consentimiento (art. 6.1.a del RGPD y art. 22.2 de la LSSI). Elegir
                  «Solo necesarias» no autoriza estas herramientas. No hay medición con Google ni
                  con Meta cuando rechazas la analítica, y los totales del apartado 4 no se envían a
                  Google Tag Manager.
                </p>
                <p className="mt-3">
                  Cómo retirarlo: en el pie de página, <strong>Configuración de cookies</strong>{" "}
                  (visible sin abrir el bloque Legal). En el panel, en administración, en
                  documentos y en la página de acceso está el mismo enlace. Vuelve la
                  barra. Si eliges «Solo necesarias», la preferencia queda guardada y, en la
                  siguiente carga de la página, Google Tag Manager, Google Analytics, Meta Pixel y
                  Speed Insights no se vuelven a cargar. También puedes borrar los datos del sitio
                  en el navegador.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  6. Cómo pedimos la elección
                </h2>
                <p>
                  Al entrar aparece una <strong>barra fija en la parte inferior</strong> que no
                  bloquea la navegación, hasta que eliges <strong>«Solo necesarias»</strong> o{" "}
                  <strong>«Aceptar todas»</strong>. Las dos opciones están a un clic y no hay muro
                  de cookies. Hasta que eliges no se cargan Google Tag Manager, Google Analytics,
                  Meta Pixel ni Speed Insights.
                </p>
                <p className="mt-3">
                  Si pasa un minuto y todavía no has elegido, puede mostrarse un aviso pequeño, una
                  sola vez en esa carga. Puedes aceptarlo, quedarte solo con las necesarias o
                  cerrarlo con «Ahora no». Cerrarlo no cuenta como aceptar ni como rechazar: la
                  barra sigue hasta que elijas. Si ya habías elegido, ese aviso no sale y no se
                  repite cada minuto.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  7. Transferencias y terceros
                </h2>
                <p>
                  La medición agregada del apartado 4 se queda en Diligenz: no se cede a Google ni a
                  Meta. Google Tag Manager, Google Analytics, Meta Pixel y Speed Insights solo tratan
                  datos si has aceptado la analítica. Si un proveedor está fuera del EEE, se aplican
                  las garantías del RGPD (decisiones de adecuación, cláusulas tipo u otras medidas).
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  8. Cómo gestionar cookies en tu navegador
                </h2>
                <p>
                  Puedes bloquear o eliminar cookies desde la configuración de Chrome, Firefox,
                  Safari, Edge, etc. Ten en cuenta que desactivar cookies necesarias puede impedir el
                  inicio de sesión u otras funciones esenciales.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
                  9. Más información y contacto
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
