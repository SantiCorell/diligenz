import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-10rem)] flex flex-col justify-center bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/10 overflow-hidden">
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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src="/logo-dili-panel.png"
              alt="Diligenz"
              width={88}
              height={88}
              className="h-20 w-20 md:h-24 md:w-24 object-contain"
              priority
            />
          </div>

          <span className="inline-block mb-4 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-4 py-1.5 text-xs font-medium text-[var(--brand-primary)]">
            Marketplace líder en España — Compra, vende y valora empresas
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--brand-primary)] mb-4 leading-snug">
            Compra, vende y valora empresas
            <br />
            <span className="text-[var(--foreground)] opacity-90">
              en España con total confianza
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed mb-2">
            Accede a más de 1.500 empresas verificadas en venta. Valoración en minutos, inversores verificados y asesoramiento hasta el cierre.
          </p>
          <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-80">
            Privado, seguro y 100% enfocado en el mercado español.
          </p>

          {/* Beneficios destacados */}
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs sm:text-sm text-[var(--foreground)] opacity-85">
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--brand-bg-mint)] text-sm font-bold">✓</span>
              <span>100% Privado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--brand-bg-mint)] text-sm font-bold">✓</span>
              <span>Inversores Verificados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--brand-bg-mint)] text-sm font-bold">✓</span>
              <span>Valoración Instantánea</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--brand-bg-mint)] text-sm font-bold">✓</span>
              <span>Soporte Dedicado</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
          <Link
            href="/register"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition text-center"
          >
            Crear cuenta gratuita
          </Link>
          <Link
            href="/sell"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition text-center"
          >
            Vender mi empresa
          </Link>
          <Link
            href="/companies"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition text-center"
          >
            Ver empresas disponibles
          </Link>
        </div>
      </div>
    </section>
  );
}
