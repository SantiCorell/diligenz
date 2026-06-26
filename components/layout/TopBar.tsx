import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function TopBar({ onHero = false }: { onHero?: boolean }) {
  return (
    <div className="relative z-40 px-4 pt-2 sm:px-6">
      <div
        className={`topbar-promo mx-auto flex max-w-6xl flex-col items-center justify-between gap-2.5 rounded-2xl border px-4 py-2.5 shadow-[0_4px_24px_rgba(145,70,255,0.12)] backdrop-blur-md sm:flex-row sm:gap-4 sm:px-5 sm:py-2.5 ${
          onHero
            ? "border-white/25 bg-white/20"
            : "border-[var(--brand-primary)]/15 bg-gradient-to-r from-[var(--brand-primary)]/12 via-white/70 to-[var(--brand-bg-mint)]/50"
        }`}
      >
        <p className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-[var(--brand-dark)] sm:justify-start sm:text-left">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-bg-mint)] text-[var(--brand-dark)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span>
            <span className="sm:hidden">
              <span className="text-[var(--brand-primary)]">Gratis</span> · Valora en 2 min
            </span>
            <span className="hidden sm:inline">
              <span className="rounded-md bg-[var(--brand-bg-mint)] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[var(--brand-dark)]">
                Gratis
              </span>{" "}
              Valora tu empresa en{" "}
              <span className="text-[var(--brand-primary)]">2 minutos</span>
              <span className="font-normal text-[var(--brand-dark)]/65"> · Sin registro</span>
            </span>
          </span>
        </p>
        <Link
          href="/sell"
          className="topbar-cta flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-orange-500/35 transition hover:scale-[1.02] hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 sm:w-auto"
        >
          Valorar ahora
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
