"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import CompanyCard from "./CompanyCard";
import CompaniesFilters from "./CompaniesFilters";
import PrimarySectorFilter from "./PrimarySectorFilter";
import CompaniesResultsBar from "./CompaniesResultsBar";
import type { CompanyMock } from "@/lib/mock-companies";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Props = {
  companies: CompanyMock[];
  isLoggedIn: boolean;
  locationFromUrl?: string;
  locations: string[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sectorSlugFromUrl?: string | null;
  sectorCounts: Record<string, number>;
  catalogTotal: number;
};

function buildQuery(sector: string, location: string, page: number): string {
  const p = new URLSearchParams();
  if (sector) p.set("sector", sector);
  if (location) p.set("location", location);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `?${q}` : "";
}

export default function CompaniesGrid({
  companies,
  isLoggedIn,
  locationFromUrl = "",
  locations,
  total,
  totalPages,
  currentPage,
  pageSize,
  sectorSlugFromUrl = "",
  sectorCounts,
  catalogTotal,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [sector, setSector] = useState(sectorSlugFromUrl ?? "");
  const [location, setLocation] = useState(locationFromUrl ?? "");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reflejar sector/ubicación de la URL en los filtros */
    setSector(sectorSlugFromUrl ?? "");
    setLocation(locationFromUrl ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sectorSlugFromUrl, locationFromUrl]);

  const navigate = (nextSector: string, nextLocation: string, page: number) => {
    router.push(pathname + buildQuery(nextSector, nextLocation, page));
  };

  const handleSectorChange = (value: string) => {
    setSector(value);
    navigate(value, location, 1);
  };
  const handleLocationChange = (value: string) => {
    setLocation(value);
    navigate(sector, value, 1);
  };
  const clearLocation = () => {
    setLocation("");
    navigate(sector, "", currentPage);
  };
  const clearSector = () => {
    setSector("");
    navigate("", location, 1);
  };

  const locationOptions = ["", ...locations];

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

  return (
    <div className="space-y-5">
      <PrimarySectorFilter
        selectedSector={sector}
        onSectorChange={handleSectorChange}
        countsBySector={sectorCounts}
        totalCount={catalogTotal}
      />

      <CompaniesResultsBar
        total={total}
        sectorSlug={sector}
        location={location}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onClearSector={sector ? clearSector : undefined}
        onClearLocation={location ? clearLocation : undefined}
      />

      <CompaniesFilters
        location={location}
        onLocationChange={handleLocationChange}
        onClearFilters={clearLocation}
        locations={locationOptions}
      />

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isLoggedIn={isLoggedIn}
              ctaLabel="Más información"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/[0.1] bg-[var(--surface-card)] px-6 py-14 text-center">
          <p className="text-base font-semibold text-[var(--foreground)]">
            No hay empresas con estos filtros
          </p>
          <p className="mt-2 text-sm text-[var(--foreground)]/60 max-w-md mx-auto">
            Prueba otro sector principal o amplía la ubicación. También puedes ver todo el catálogo sin filtros.
          </p>
          {(sector || location) && (
            <button
              type="button"
              onClick={() => {
                setSector("");
                setLocation("");
                navigate("", "", 1);
              }}
              className="mt-5 inline-flex items-center rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
            >
              Ver todas las empresas
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-[var(--surface-card)] px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          aria-label="Paginación de empresas"
        >
          <p className="text-sm text-[var(--foreground)]/60 order-2 sm:order-1">
            Página <span className="font-semibold text-[var(--foreground)]">{currentPage}</span> de{" "}
            <span className="font-semibold text-[var(--foreground)]">{totalPages}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 sm:order-2">
            <PaginationButton
              disabled={currentPage <= 1}
              onClick={() => navigate(sector, location, 1)}
              href={currentPage <= 1 ? undefined : pathname + buildQuery(sector, location, 1)}
              label="Primera página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              disabled={currentPage <= 1}
              onClick={() => navigate(sector, location, currentPage - 1)}
              href={
                currentPage <= 1 ? undefined : pathname + buildQuery(sector, location, currentPage - 1)
              }
              label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-0.5">Anterior</span>
            </PaginationButton>

            {pageNumbers.map((p, i, arr) => (
              <span key={p} className="inline-flex items-center">
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span className="px-1.5 text-[var(--foreground)]/40 text-sm">…</span>
                )}
                {p === currentPage ? (
                  <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white text-sm font-semibold shadow-sm">
                    {p}
                  </span>
                ) : (
                  <a
                    href={pathname + buildQuery(sector, location, p)}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(sector, location, p);
                    }}
                    className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--brand-primary)]/10 transition"
                  >
                    {p}
                  </a>
                )}
              </span>
            ))}

            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => navigate(sector, location, currentPage + 1)}
              href={
                currentPage >= totalPages
                  ? undefined
                  : pathname + buildQuery(sector, location, currentPage + 1)
              }
              label="Página siguiente"
            >
              <span className="hidden sm:inline mr-0.5">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </PaginationButton>
            <PaginationButton
              disabled={currentPage >= totalPages}
              onClick={() => navigate(sector, location, totalPages)}
              href={
                currentPage >= totalPages ? undefined : pathname + buildQuery(sector, location, totalPages)
              }
              label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </div>
        </nav>
      )}
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
  href,
  label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  href?: string;
  label: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (disabled) e.preventDefault();
        else {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={label}
      aria-disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 sm:px-3 py-2 text-sm font-medium transition ${
        disabled
          ? "pointer-events-none text-[var(--foreground)]/30"
          : "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
      }`}
    >
      {children}
    </a>
  );
}
