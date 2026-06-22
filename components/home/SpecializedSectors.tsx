import Link from "next/link";
import { HeartPulse, Cpu, Factory, ShoppingBag, ArrowRight } from "lucide-react";

const sectors = [
  {
    name: "Salud",
    slug: "salud",
    tag: "Salud",
    description: "Clínicas, laboratorios y servicios sanitarios privados.",
    icon: HeartPulse,
    iconBg: "bg-rose-100 text-rose-600",
    tagBg: "bg-rose-50 text-rose-700",
  },
  {
    name: "Tecnología",
    slug: "tecnologia",
    tag: "Tecnología",
    description: "SaaS, software B2B y negocios digitales escalables.",
    icon: Cpu,
    iconBg: "bg-violet-100 text-violet-600",
    tagBg: "bg-violet-50 text-violet-700",
  },
  {
    name: "Industria",
    slug: "industria",
    tag: "Industria",
    description: "Fabricación, logística e ingeniería especializada.",
    icon: Factory,
    iconBg: "bg-slate-100 text-slate-600",
    tagBg: "bg-slate-50 text-slate-700",
  },
  {
    name: "Consumo",
    slug: "consumo",
    tag: "Consumo",
    description: "Retail, marcas y e-commerce consolidados.",
    icon: ShoppingBag,
    iconBg: "bg-amber-100 text-amber-600",
    tagBg: "bg-amber-50 text-amber-700",
  },
];

export default function SpecializedSectors() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--brand-dark)] sm:text-3xl">
            Sectores especializados
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--foreground)]/70 sm:text-base">
            Analizamos y acompañamos operaciones en sectores con alta actividad y demanda
            inversora.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.slug}
                className="flex flex-col rounded-2xl border border-[var(--brand-primary)]/10 bg-[var(--brand-surface)] p-6 transition hover:border-[var(--brand-primary)]/25 hover:shadow-md"
              >
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${sector.tagBg}`}
                >
                  {sector.tag}
                </span>
                <div
                  className={`mt-4 flex h-12 w-12 items-center justify-center rounded-full ${sector.iconBg}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">
                  {sector.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--foreground)]/70">
                  {sector.description}
                </p>
                <Link
                  href={`/companies?sector=${sector.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-primary)] hover:gap-2.5 transition-all"
                >
                  Ver empresas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
