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
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-0 pt-8 text-center sm:px-10 sm:pt-10 md:px-12">
        <span className="inline-flex rounded-full bg-[var(--brand-bg-mint)] px-5 py-2 text-xs font-semibold text-[var(--brand-dark)] sm:text-sm">
          Marketplace líder en España — Compra, vende y valora empresas
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.65rem] md:leading-[1.12]">
          Compra, vende y valora empresas
          <br />
          en España con total confianza
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          Accede a{" "}
          <strong className="font-semibold text-white">más de 1.500 empresas verificadas en venta</strong>
          . Valoración en minutos, inversores verificados y asesoramiento hasta el cierre.
        </p>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/95">
          {BENEFITS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-bg-mint)] text-[11px] font-bold text-[#3d5c1a]">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
          <Link
            href="/register"
            className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--brand-primary)] shadow-md transition hover:bg-white/95 sm:w-auto"
          >
            Crear cuenta gratuita
          </Link>
          <Link
            href="/sell"
            className="w-full rounded-full border-2 border-white/70 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Vender mi empresa
          </Link>
          <Link
            href="/companies"
            className="w-full rounded-full border-2 border-white/70 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Ver empresas disponibles
          </Link>
        </div>
      </div>

      <div className="hero-panel-video">
        <HeroVideo />
      </div>
    </section>
  );
}
