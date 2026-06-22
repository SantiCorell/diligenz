import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-[var(--brand-bg-mint)] px-6 py-12 text-center md:px-12 md:py-14">
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            Empieza hoy a comprar o vender empresas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--foreground)]/75 sm:text-base">
            Únete a la comunidad de inversores y empresarios que confían en Diligenz.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-2xl bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 sm:w-auto"
            >
              Crear cuenta gratuita
            </Link>
            <Link
              href="/companies"
              className="w-full rounded-2xl border-2 border-[var(--brand-dark)]/20 bg-white/60 px-7 py-3.5 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-white sm:w-auto"
            >
              Ver empresas disponibles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
