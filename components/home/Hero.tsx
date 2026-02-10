import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/10 overflow-hidden">
      {/* Ilustración de fondo: red de conexiones (compradores ↔ vendedores) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <svg
          className="absolute inset-0 w-full h-full hero-bg-float"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Nodos y líneas suaves: sensación de red profesional */}
          <defs>
            <linearGradient id="hero-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="hero-dot" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-primary)" />
              <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* Líneas de conexión suaves */}
          <path d="M100 200 Q400 100 700 250 T1100 180" stroke="url(#hero-line)" strokeWidth="1.5" fill="none" className="hero-line" />
          <path d="M80 400 Q350 350 600 450 T1100 380" stroke="url(#hero-line)" strokeWidth="1.2" fill="none" className="hero-line hero-line-2" />
          <path d="M150 600 Q500 500 850 550 T1150 620" stroke="url(#hero-line)" strokeWidth="1" fill="none" className="hero-line hero-line-3" />
          <path d="M200 350 L500 320 L800 360 L1050 340" stroke="url(#hero-line)" strokeWidth="0.8" fill="none" strokeDasharray="8 12" className="hero-line hero-line-4" />
          {/* Nodos (puntos de la red) */}
          <circle cx="120" cy="200" r="4" fill="url(#hero-dot)" className="hero-dot" />
          <circle cx="400" cy="120" r="5" fill="url(#hero-dot)" className="hero-dot hero-dot-2" />
          <circle cx="700" cy="260" r="3" fill="url(#hero-dot)" className="hero-dot hero-dot-3" />
          <circle cx="1080" cy="190" r="4" fill="url(#hero-dot)" className="hero-dot" />
          <circle cx="100" cy="400" r="3" fill="url(#hero-dot)" className="hero-dot hero-dot-2" />
          <circle cx="600" cy="450" r="5" fill="url(#hero-dot)" className="hero-dot hero-dot-3" />
          <circle cx="1100" cy="380" r="3" fill="url(#hero-dot)" className="hero-dot" />
          <circle cx="200" cy="600" r="4" fill="url(#hero-dot)" className="hero-dot hero-dot-2" />
          <circle cx="850" cy="560" r="3" fill="url(#hero-dot)" className="hero-dot hero-dot-3" />
          <circle cx="600" cy="400" r="6" fill="url(#hero-dot)" className="hero-dot hero-dot-main" />
        </svg>
      </div>
      {/* Blur suave adicional para llenar el espacio */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--brand-primary)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--brand-primary)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--brand-primary)] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14 md:py-16">
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
            Marketplace líder en España — Compra, vende y valora empresas
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--brand-primary)] mb-6 leading-tight">
            Compra, vende y valora empresas
            <br />
            <span className="text-[var(--foreground)] opacity-90">
              en España con total confianza
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-[var(--foreground)] opacity-90 leading-relaxed mb-4">
            La plataforma de referencia en España para M&A y compraventa de pymes. Valoración en minutos, inversores verificados y asesoramiento hasta el cierre.
            <br />
            <span className="text-lg sm:text-xl opacity-80">
              Privado, seguro y 100% enfocado en el mercado español.
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
