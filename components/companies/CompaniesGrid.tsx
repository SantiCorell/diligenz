"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import CompanyCard from "./CompanyCard";
import CompaniesFilters from "./CompaniesFilters";
import RegisterModal from "@/components/auth/RegisterModal";
import type { CompanyMock } from "@/lib/mock-companies";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SECTOR_OPTIONS = [
  { value: "", label: "Todos los sectores" },
  { value: "salud", label: "Salud" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "industria", label: "Industria" },
  { value: "consumo", label: "Consumo" },
  { value: "energia", label: "Energía" },
  { value: "logistica", label: "Logística" },
];

type Props = {
  companies: CompanyMock[];
  isLoggedIn: boolean;
  sectorFromUrl?: string | null;
  locationFromUrl?: string;
  locations: string[];
  total: number;
  totalPages: number;
  currentPage: number;
  sectorSlugFromUrl?: string | null;
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
  sectorFromUrl: _sectorFromUrl,
  locationFromUrl = "",
  locations,
  total,
  totalPages,
  currentPage,
  sectorSlugFromUrl = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [sector, setSector] = useState(sectorSlugFromUrl ?? "");
  const [location, setLocation] = useState(locationFromUrl ?? "");

  useEffect(() => {
    setSector(sectorSlugFromUrl ?? "");
    setLocation(locationFromUrl ?? "");
  }, [sectorSlugFromUrl, locationFromUrl]);

  const handleSectorChange = (value: string) => {
    setSector(value);
    router.push(pathname + buildQuery(value, location, 1));
  };
  const handleLocationChange = (value: string) => {
    setLocation(value);
    router.push(pathname + buildQuery(sector, value, 1));
  };
  const clearFilters = () => {
    setSector("");
    setLocation("");
    router.push(pathname + buildQuery("", "", 1));
  };

  const locationOptions = ["", ...locations];

  return (
    <>
      <CompaniesFilters
        sector={sector}
        location={location}
        onSectorChange={handleSectorChange}
        onLocationChange={handleLocationChange}
        onClearFilters={clearFilters}
        sectors={SECTOR_OPTIONS}
        locations={locationOptions}
      />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company, i) => (
          <CompanyCard
            key={company.id}
            company={company}
            isLoggedIn={isLoggedIn}
            onRequestAuth={() => setRegisterModalOpen(true)}
            linkToFicha
            positionInGroup={i}
          />
        ))}
      </div>
      {companies.length === 0 && (
        <p className="mt-8 text-center text-[var(--foreground)] opacity-80">
          No hay empresas con los filtros seleccionados. Prueba a cambiar sector o ubicación.
        </p>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label="Paginación de empresas"
        >
          <span className="mr-2 text-sm text-[var(--foreground)] opacity-80">
            {total} empresa{total !== 1 ? "s" : ""} · Página {currentPage} de {totalPages}
          </span>
          <a
            href={currentPage <= 1 ? undefined : pathname + buildQuery(sector, location, currentPage - 1)}
            onClick={(e) => {
              if (currentPage <= 1) e.preventDefault();
              else {
                e.preventDefault();
                router.push(pathname + buildQuery(sector, location, currentPage - 1));
              }
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              currentPage <= 1
                ? "pointer-events-none text-[var(--foreground)]/40"
                : "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
            }`}
            aria-disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </a>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span className="px-2 text-[var(--foreground)]/50">…</span>
                )}
                {p === currentPage ? (
                  <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium">
                    {p}
                  </span>
                ) : (
                  <a
                    href={pathname + buildQuery(sector, location, p)}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(pathname + buildQuery(sector, location, p));
                    }}
                    className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--brand-primary)]/10 transition"
                  >
                    {p}
                  </a>
                )}
              </span>
            ))}
          <a
            href={currentPage >= totalPages ? undefined : pathname + buildQuery(sector, location, currentPage + 1)}
            onClick={(e) => {
              if (currentPage >= totalPages) e.preventDefault();
              else {
                e.preventDefault();
                router.push(pathname + buildQuery(sector, location, currentPage + 1));
              }
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              currentPage >= totalPages
                ? "pointer-events-none text-[var(--foreground)]/40"
                : "text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
            }`}
            aria-disabled={currentPage >= totalPages}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </a>
        </nav>
      )}

      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </>
  );
}
