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
      <div className="hero-copy mx-auto max-w-6xl px-5 pb-0 pt-10 text-center sm:px-10 sm:pt-14 md:px-12 md:pt-16 lg:pt-20">
        <p className="hero-eyebrow">Marketplace líder en España</p>

        <h1 className="hero-title mx-auto mt-4 max-w-5xl sm:mt-5">
          Compra, vende y valora empresas
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          en España con{" "}
          <span className="hero-title-highlight">total confianza</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:mt-7 sm:text-lg md:max-w-3xl">
          Accede a{" "}
          <strong className="font-semibold text-white">más de 1.500 empresas verificadas en venta</strong>
          . Valoración en minutos, inversores verificados y asesoramiento hasta el cierre.
        </p>

        <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/95 sm:mt-8 sm:text-base">
          {BENEFITS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-bg-mint)] text-[11px] font-bold text-[#3d5c1a] sm:h-6 sm:w-6 sm:text-xs">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap md:mt-12">
          <Link
            href="/register"
            className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--brand-primary)] shadow-md transition hover:bg-white/95 sm:w-auto sm:text-base"
          >
            Crear cuenta gratuita
          </Link>
          <Link
            href="/sell"
            className="w-full rounded-full border-2 border-white/70 bg-transparent px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:text-base"
          >
            Vender mi empresa
          </Link>
          <Link
            href="/companies"
            className="w-full rounded-full border-2 border-white/70 bg-transparent px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:text-base"
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
