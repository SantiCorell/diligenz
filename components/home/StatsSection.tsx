const STATS = [
  { value: "+1.500", label: "Empresas en el marketplace", featured: true },
  { value: "+2.400", label: "Usuarios registrados", featured: false },
  { value: "+3.200", label: "Valoraciones realizadas", featured: false },
  { value: "4,2 M€", label: "Volumen en operaciones cerradas", featured: false },
];

export default function StatsSection() {
  return (
    <section className="bg-[var(--brand-bg)] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl px-5 py-6 text-center transition ${
                stat.featured
                  ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/20"
                  : "border-2 border-[var(--brand-primary)]/20 bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold sm:text-3xl ${
                  stat.featured ? "text-white" : "text-[var(--brand-primary)]"
                }`}
              >
                {stat.value}
              </p>
              <p
                className={`mt-2 text-xs leading-snug sm:text-sm ${
                  stat.featured ? "text-white/90" : "text-[var(--foreground)]/75"
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
