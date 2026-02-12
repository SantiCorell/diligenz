import Link from "next/link";
import Image from "next/image";

const sectors = [
  {
    name: "Salud",
    slug: "salud",
    description:
      "Clínicas, laboratorios y servicios sanitarios privados.",
    stat: "+120 empresas activas en venta",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  },
  {
    name: "Tecnología",
    slug: "tecnologia",
    description:
      "SaaS, software B2B y negocios digitales escalables.",
    stat: "Sector líder en inversión",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  },
  {
    name: "Industria",
    slug: "industria",
    description:
      "Fabricación, logística e ingeniería especializada.",
    stat: "Alta demanda internacional",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
  },
  {
    name: "Consumo",
    slug: "consumo",
    description:
      "Retail, marcas y e-commerce consolidados.",
    stat: "Fuerte proceso de consolidación",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  },
];

export default function SpecializedSectors() {
  return (
    <section className="bg-[var(--brand-bg)] py-10 md:py-12 border-t border-[var(--brand-primary)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Sectores especializados
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-85 max-w-2xl">
          Analizamos y acompañamos operaciones en sectores con alta actividad y demanda inversora.
        </p>

        <p className="md:hidden mt-6 text-center text-xs text-[var(--foreground)] opacity-70">
          Desliza para ver sectores →
        </p>

        <div className="mt-6 md:mt-10 flex md:grid overflow-x-auto md:overflow-visible gap-4 md:gap-6 pb-3 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector) => (
            <div
              key={sector.slug}
              className="bg-white rounded-xl overflow-hidden border border-[var(--brand-primary)]/10 shadow-md hover:shadow-lg transition min-w-[280px] max-w-[280px] md:min-w-0 md:max-w-none shrink-0 snap-center md:snap-align-none"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={sector.image}
                  alt={sector.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-3 left-3 right-3 text-base font-semibold text-white drop-shadow-sm">
                  {sector.name}
                </h3>
              </div>
              <div className="p-4 bg-white">
                <p className="text-sm text-[var(--foreground)] opacity-90 leading-relaxed">
                  {sector.description}
                </p>
                <p className="mt-1.5 text-xs text-[var(--foreground)] opacity-75">
                  {sector.stat}
                </p>
                <Link
                  href={`/companies?sector=${sector.slug}`}
                  className="inline-block mt-3 text-sm font-medium text-[var(--brand-primary)] hover:underline"
                >
                  Ver empresas →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
