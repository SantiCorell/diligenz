import Link from "next/link";
import HeroVideo from "./HeroVideo";

const BENEFITS = [
  "100% Privado",
  "Inversores Verificados",
  "Valoración Instantánea",
  "Soporte Dedicado",
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#EDE8FF] via-white to-white">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[var(--brand-bg-mint)]/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 top-32 h-64 w-64 rounded-full bg-[var(--brand-primary)]/15 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-4 pt-10 pb-6 text-center sm:px-6 sm:pt-14 sm:pb-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--brand-dark)] sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
          Compra, vende y valora empresas
          <br />
          <span className="text-[var(--brand-primary)]">en España con total confianza</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--foreground)]/80 sm:text-lg">
          Accede a{" "}
          <strong className="font-semibold text-[var(--brand-primary)]">
            más de 1.500 empresas verificadas en venta
          </strong>
          . Valoración en minutos, inversores verificados y asesoramiento hasta el cierre.
        </p>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--foreground)]/75">
          {BENEFITS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-bg-mint)] text-xs font-bold text-[var(--brand-dark)]">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/register"
            className="w-full rounded-2xl bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand-primary)]/25 transition hover:opacity-95 sm:w-auto"
          >
            Crear cuenta gratuita
          </Link>
          <Link
            href="/sell"
            className="w-full rounded-2xl border-2 border-[var(--brand-primary)]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/5 sm:w-auto"
          >
            Vender mi empresa
          </Link>
          <Link
            href="/companies"
            className="w-full rounded-2xl border-2 border-[var(--brand-primary)]/25 bg-white px-7 py-3.5 text-sm font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/5 sm:w-auto"
          >
            Ver empresas disponibles
          </Link>
        </div>
      </div>

      <HeroVideo />
    </section>
  );
}
