export default function ValuationCTA() {
  return (
    <section className="bg-[var(--brand-bg)] py-28 border-t border-[var(--brand-primary)]/10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block mb-3 rounded-full bg-[var(--brand-bg-mint)] px-4 py-1 text-sm text-[var(--brand-primary)]">
            Valoración gratuita
          </span>
          <h2 className="text-3xl font-semibold text-[var(--brand-primary)]">
            Valora tu empresa en minutos
          </h2>

          <p className="mt-4 text-[var(--foreground)] opacity-85">
            Estimación orientativa basada en facturación, rentabilidad, sector
            y ubicación. Sin registro obligatorio.
          </p>

          <a
            href="/sell"
            className="inline-block mt-6 rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white font-medium hover:opacity-90 transition"
          >
            Valorar mi empresa ahora →
          </a>
        </div>

        <div className="rounded-2xl border border-[var(--brand-primary)]/20 p-6 bg-[var(--brand-bg)]">
          <ul className="space-y-3 text-[var(--foreground)] opacity-90">
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
