import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/5 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--brand-primary)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-32">
        <div className="text-center mb-12">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-dili-panel.png"
              alt="Diligenz"
              width={120}
              height={120}
              className="h-24 w-24 md:h-32 md:w-32 object-contain"
              priority
            />
          </div>

          <span className="inline-block mb-6 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-6 py-2 text-sm font-medium text-[var(--brand-primary)]">
            Marketplace privado para compraventa de empresas
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--brand-primary)] mb-6 leading-tight">
            Tu futuro empresarial
            <br />
            <span className="text-[var(--foreground)] opacity-90">
              comienza aquí
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-[var(--foreground)] opacity-90 leading-relaxed mb-4">
            El marketplace más confiable de España para comprar, vender y valorar empresas.
            <br />
            <span className="text-lg sm:text-xl opacity-80">
              Conecta con inversores verificados y oportunidades exclusivas en un entorno 100% privado y seguro.
            </span>
          </p>

          {/* Beneficios destacados */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm sm:text-base text-[var(--foreground)] opacity-80">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl font-bold">✓</span>
              <span>100% Privado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl font-bold">✓</span>
              <span>Inversores Verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl font-bold">✓</span>
              <span>Valoración Instantánea</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl font-bold">✓</span>
              <span>Soporte Dedicado</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/sell"
            className="rounded-xl bg-[var(--brand-primary)] px-8 py-4 text-white font-semibold hover:opacity-90 transition shadow-lg hover:shadow-xl text-center"
          >
            Vender mi empresa
          </Link>
          <Link
            href="/companies"
            className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-8 py-4 font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition shadow-md hover:shadow-lg text-center"
          >
            Ver empresas disponibles
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-white border-2 border-[var(--brand-primary)]/20 px-8 py-4 font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition shadow-md hover:shadow-lg text-center"
          >
            Crear cuenta gratuita
          </Link>
        </div>
      </div>
    </section>
  );
}
