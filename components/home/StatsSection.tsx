const STATS = [
  { value: "+1.500", label: "Empresas en el marketplace", featured: true },
  { value: "+2.400", label: "Usuarios registrados", featured: false },
  { value: "+3.200", label: "Valoraciones realizadas", featured: false },
  { value: "4,2 M€", label: "Volumen en operaciones cerradas", featured: false },
];

export default function StatsSection() {
  return (
    <section className="relative pb-12 pt-0 md:pb-16" aria-label="Cifras de Diligenz">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={`flex min-h-[7.25rem] flex-col items-center justify-center rounded-2xl px-4 py-6 text-center sm:min-h-[8.25rem] sm:px-5 sm:py-7 ${
                stat.featured
                  ? "bg-gradient-to-br from-[var(--gradient-start)] via-[var(--brand-primary)] to-[var(--gradient-end)] text-white shadow-[0_10px_36px_rgb(145_70_255/20%)]"
                  : "bg-[var(--surface-muted)] text-[var(--brand-dark)]"
              }`}
            >
              <p
                className={`text-[1.6rem] font-bold leading-none tracking-tight sm:text-[1.85rem] ${
                  stat.featured ? "text-white" : "text-[var(--brand-dark)]"
                }`}
              >
                {stat.value}
              </p>
              <p
                className={`mt-2.5 max-w-[9.5rem] text-[11px] leading-snug sm:max-w-none sm:text-[0.82rem] ${
                  stat.featured ? "text-white/95" : "text-[var(--foreground)]"
                }`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
