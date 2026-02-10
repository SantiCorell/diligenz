import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[var(--brand-bg)] py-10 md:py-12 border-t border-[var(--brand-primary)]/10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--brand-primary)]">
          Empieza hoy a comprar o vender empresas
        </h2>

        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Únete a la comunidad de inversores y empresarios que confían en Diligenz.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Crear cuenta gratuita
          </Link>
          <Link
            href="/companies"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition"
          >
            Ver empresas disponibles
          </Link>
        </div>
      </div>
    </section>
  );
}
