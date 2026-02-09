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
    <section className="bg-[var(--brand-bg)] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-[var(--brand-primary)]">
          Sectores en los que estamos especializados
        </h2>
        <p className="mt-3 text-[var(--foreground)] opacity-85 max-w-2xl">
          Analizamos y acompañamos operaciones en sectores con alta
          actividad y demanda inversora.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectors.map((sector) => (
            <div
              key={sector.slug}
              className="bg-[var(--brand-bg-lavender)] rounded-xl overflow-hidden border border-[var(--brand-primary)]/10 hover:shadow-lg transition"
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
                <h3 className="absolute bottom-3 left-3 right-3 text-lg font-semibold text-white">
                  {sector.name}
                </h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-[var(--foreground)] opacity-85">
                  {sector.description}
                </p>
                <p className="mt-2 text-xs opacity-75">
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
