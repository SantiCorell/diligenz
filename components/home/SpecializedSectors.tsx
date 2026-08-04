import Link from "next/link";
import { HOMEPAGE_FEATURED_SECTORS, getSectorVisual } from "@/lib/sector-visual";

const MOBILE_CAROUSEL =
  "-mx-4 flex gap-4 overflow-x-auto scroll-px-4 px-4 snap-x snap-mandatory pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:scroll-px-0 sm:px-0 sm:pb-0 sm:pt-0 lg:grid-cols-4";

const MOBILE_CARD =
  "w-[min(82vw,300px)] shrink-0 snap-center sm:w-auto sm:shrink sm:snap-align-none";

function descriptionBullets(description: string): string[] {
  return description
    .split(/,| y |·|\./i)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 3);
}

function SectorCard({
  slug,
  description,
}: {
  slug: string;
  description: string;
}) {
  const visual = getSectorVisual(slug);
  const Icon = visual.icon;
  const bullets = descriptionBullets(description);

  return (
    <Link
      href={`/companies?sector=${slug}`}
      className={`group flex flex-col gap-3 rounded-[1.35rem] bg-white p-5 shadow-sm outline-none transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(145,70,255,0.35)] focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 ${MOBILE_CARD}`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${visual.iconBgClass}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </div>

      <h3 className="text-lg font-extrabold tracking-tight text-[var(--brand-dark)]">
        {visual.shortLabel}
      </h3>

      <ul className="flex flex-1 flex-col gap-1.5 text-sm text-[var(--brand-dark)]/65">
        {(bullets.length > 0 ? bullets : [description]).map((item) => (
          <li key={item} className="flex gap-2">
            <span className="font-extrabold text-[var(--brand-primary)]" aria-hidden>
              ·
            </span>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>

      <span className="mt-1 inline-flex self-start rounded-full bg-[var(--brand-accent)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--brand-dark)]">
        Sector especializado
      </span>

      <span className="text-sm font-bold text-[var(--brand-primary)] group-hover:underline group-hover:underline-offset-4">
        Ver empresas →
      </span>
    </Link>
  );
}

export default function SpecializedSectors() {
  return (
    <section className="relative py-14 md:py-20" aria-labelledby="sectores-especializados-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-[1.75rem] bg-[var(--brand-surface)] px-4 py-8 sm:px-6 sm:py-10 md:px-8">
          <div className="text-center">
            <p className="page-eyebrow">Sectores</p>
            <h2
              id="sectores-especializados-heading"
              className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-3xl"
            >
              Sectores especializados
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--brand-dark)]/60 sm:text-base">
              Analizamos y acompañamos operaciones en sectores con alta actividad y demanda
              inversora.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[var(--brand-dark)]/50 sm:hidden">
            Desliza para ver todos los sectores →
          </p>

          <div className={`mt-4 sm:mt-8 ${MOBILE_CAROUSEL}`}>
            {HOMEPAGE_FEATURED_SECTORS.map((sector) => (
              <SectorCard
                key={sector.slug}
                slug={sector.slug}
                description={sector.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
