const STATS = [
  { value: "150+", label: "Empresas en cartera" },
  { value: "2.400+", label: "Usuarios registrados" },
  { value: "3.200+", label: "Valoraciones realizadas" },
  { value: "4,2 M€", label: "Volumen en operaciones cerradas" },
];

export default function StatsSection() {
  return (
    <section className="bg-[var(--brand-bg)] py-12 md:py-14 border-y border-[var(--brand-primary)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)] opacity-80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
