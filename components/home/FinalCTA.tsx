import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[var(--brand-bg)] py-12 md:py-16 border-t border-[var(--brand-primary)]/10">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-4xl font-semibold text-[var(--brand-primary)]">
          Empieza hoy a comprar o vender empresas
        </h2>

        <p className="mt-4 text-lg text-[var(--foreground)] opacity-85">
          Únete a la comunidad de inversores y empresarios que confían en
          DILIGENZ.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <Link
            href="/register"
            className="rounded-xl bg-[var(--brand-primary)] px-8 py-4 text-white font-medium hover:opacity-90 transition"
          >
            Crear cuenta gratuita
          </Link>
          <Link
            href="/companies"
            className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-8 py-4 font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-bg)] transition"
          >
            Ver empresas disponibles
          </Link>
        </div>
      </div>
    </section>
  );
}
