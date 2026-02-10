export default function ValuationCTA() {
  return (
    <section className="bg-[var(--brand-bg)] py-10 md:py-12 border-t border-[var(--brand-primary)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        <div>
          <span className="inline-block mb-2 rounded-full bg-[var(--brand-bg-mint)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
            Valoración gratuita
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--brand-primary)]">
            Valora tu empresa en minutos
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
            Estimación orientativa basada en facturación, rentabilidad, sector y ubicación. Sin registro obligatorio.
          </p>

          <a
            href="/sell"
            className="inline-block mt-5 rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Valorar mi empresa ahora →
          </a>
        </div>

        <div className="rounded-xl border border-[var(--brand-primary)]/15 p-5 bg-white shadow-md">
          <ul className="space-y-2 text-sm text-[var(--foreground)] opacity-90">
            <li>✔ Sin registro obligatorio</li>
            <li>✔ Datos confidenciales</li>
            <li>✔ Resultado inmediato</li>
            <li>✔ Basado en mercado real</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
