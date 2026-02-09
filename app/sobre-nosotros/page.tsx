import ShellLayout from "@/components/layout/ShellLayout";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Sobre nosotros",
  description:
    "Conoce Diligenz y a nuestro socio estratégico Cañizares Valle, despacho con más de 50 años de experiencia en asesoramiento empresarial.",
};

export default function SobreNosotrosPage() {
  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
            Sobre nosotros
          </h1>
          <p className="mt-4 text-lg text-[var(--foreground)] opacity-90">
            Conectamos compradores y vendedores de empresas. Unifica compra, venta y valoración en una sola plataforma que aporta claridad a tus operaciones de M&A.
          </p>

          <div className="mt-12 space-y-8 text-[var(--foreground)] opacity-90 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[var(--brand-primary)] mb-3">
                Qué hacemos
              </h2>
              <p>
                En <strong>Diligenz</strong> ofrecemos un marketplace privado para la compraventa de empresas. Ayudamos a propietarios e inversores a encontrar oportunidades, realizar valoraciones orientativas y cerrar operaciones con confidencialidad y seguridad. Nuestros servicios incluyen valoración de empresas, due diligence, asesoramiento en venta y en compra, con un enfoque profesional y transparente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--brand-primary)] mb-3">
                Nuestro socio estratégico
              </h2>
              <p className="mb-6">
                Las operaciones que gestionamos cuentan con el respaldo de <strong>Cañizares Valle</strong>, despacho de abogados y consultores con más de <strong>50 años de experiencia</strong> en asesoramiento integral a empresas. Su trayectoria nos permite ofrecer a nuestros clientes soluciones jurídicas, fiscales, laborales y financieras de alto nivel en todas las fases de una operación de M&A.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-bg)]">
                <div className="relative w-48 h-24 shrink-0">
                  <Image
                    src="/logo-canizares-valle.png"
                    alt="Cañizares Valle - Despacho de abogados"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--brand-primary)]">
                    Cañizares Valle
                  </h3>
                  <p className="text-sm mt-1 opacity-85">
                    Más de 50 años de experiencia en asesoramiento fiscal, contable, laboral y jurídico empresarial. Especialistas en sector farmacéutico (más de 500 oficinas de farmacia como clientes), compraventa de empresas, sucesión familiar y consultoría especializada.
                  </p>
                  <a
                    href="https://www.canizaresvalle.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-[var(--brand-primary)] hover:underline"
                  >
                    Visitar canizaresvalle.es →
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--brand-primary)] mb-3">
                Por qué confiar en nosotros
              </h2>
              <p>
                Combinamos la agilidad y la tecnología de una plataforma digital con el respaldo de un despacho con décadas de historia. Así, nuestros clientes obtienen valoraciones rápidas, acceso a oportunidades verificadas y el soporte jurídico y fiscal necesario para tomar decisiones con seguridad.
              </p>
            </section>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/companies"
              className="rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white font-medium hover:opacity-90"
            >
              Ver empresas
            </Link>
            <Link
              href="/servicios"
              className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-6 py-3 text-[var(--brand-primary)] font-medium hover:bg-[var(--brand-primary)]/5"
            >
              Nuestros servicios
            </Link>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
