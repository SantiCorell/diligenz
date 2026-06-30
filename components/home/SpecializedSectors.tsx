import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectorIcon from "@/components/companies/SectorIcon";
import { HOMEPAGE_FEATURED_SECTORS, getSectorVisual } from "@/lib/sector-visual";

const MOBILE_CAROUSEL =
  "-mx-4 flex gap-4 overflow-x-auto scroll-px-4 px-4 snap-x snap-mandatory pb-4 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:scroll-px-0 sm:px-0 sm:pb-2 sm:pt-2 lg:grid-cols-4";

const MOBILE_CARD =
  "w-[min(82vw,300px)] shrink-0 snap-center sm:w-auto sm:shrink sm:snap-align-none";

function SectorCard({
  slug,
  description,
}: {
  slug: string;
  description: string;
}) {
  const visual = getSectorVisual(slug);
  const displayName = visual.shortLabel;

  return (
    <div
      className={`sector-card flex flex-col rounded-2xl bg-[#edeaf3] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-[#e8e4f0] hover:shadow-[0_14px_40px_rgba(145,70,255,0.12)] motion-reduce:hover:scale-100 ${MOBILE_CARD}`}
    >
      <SectorIcon sector={slug} size="md" />
      <span
        className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${visual.tagClass}`}
      >
        {displayName}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-[var(--brand-dark)]">{displayName}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--foreground)]/70">
        {description}
      </p>
      <Link
        href={`/companies?sector=${slug}`}
        className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--brand-primary)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] transition hover:border-[var(--brand-primary)]/40 hover:bg-white/90"
      >
        Ver empresas
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function SpecializedSectors() {
  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          <h2 className="text-2xl font-bold text-[var(--brand-primary)] sm:text-3xl">
            Sectores especializados
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[var(--foreground)]/70 sm:text-base md:text-right">
            Analizamos y acompañamos operaciones en sectores con alta actividad y demanda
            inversora.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--foreground)]/60 sm:hidden">
          Desliza para ver todos los sectores →
        </p>

        <div className={`mt-4 sm:mt-10 ${MOBILE_CAROUSEL}`}>
          {HOMEPAGE_FEATURED_SECTORS.map((sector) => (
            <SectorCard
              key={sector.slug}
              slug={sector.slug}
              description={sector.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
