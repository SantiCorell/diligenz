export default function HowItWorks() {
  return (
    <section className="bg-[var(--brand-bg)] py-24 border-t border-[var(--brand-primary)]/10">
      <h2 className="text-4xl font-semibold text-center text-[var(--brand-primary)]">
        ¿Cómo funciona?
      </h2>

      <p className="mt-4 text-center text-lg text-[var(--foreground)] opacity-85">
        Un proceso sencillo y transparente para comprar o vender tu empresa
      </p>

      <div className="mt-16 grid md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {[
          {
            title: "Regístrate gratis",
            text: "Crea tu cuenta en menos de 2 minutos",
          },
          {
            title: "Explora empresas",
            text: "Accede a oportunidades verificadas",
          },
          {
            title: "Analiza información",
            text: "Métricas financieras y documentos clave",
          },
          {
            title: "Conecta y cierra",
            text: "Gestiona todo el proceso de forma segura",
          },
        ].map((step, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-bg-lavender)] p-6"
          >
            <span className="text-sm font-medium text-[var(--brand-primary)] opacity-80">
              Paso {i + 1}
            </span>
            <h3 className="mt-2 text-xl font-semibold text-[var(--brand-primary)]">
              {step.title}
            </h3>
            <p className="mt-2 text-[var(--foreground)] opacity-85">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
