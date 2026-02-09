"use client";

import { useState, useMemo } from "react";
import CompanyCard from "./CompanyCard";
import CompaniesFilters from "./CompaniesFilters";
import RegisterModal from "@/components/auth/RegisterModal";
import type { CompanyMock } from "@/lib/mock-companies";

const SECTOR_OPTIONS = [
  { value: "", label: "Todos los sectores" },
  { value: "Salud", label: "Salud" },
  { value: "Tecnología", label: "Tecnología" },
  { value: "Industria", label: "Industria" },
  { value: "Consumo", label: "Consumo" },
  { value: "Energía", label: "Energía" },
  { value: "Logística", label: "Logística" },
];

type Props = {
  companies: CompanyMock[];
  isLoggedIn: boolean;
  sectorFromUrl?: string | null;
};

function getUniqueLocations(companies: CompanyMock[]) {
  const set = new Set(companies.map((c) => c.location));
  return ["", ...Array.from(set).sort()];
}

export default function CompaniesGrid({
  companies,
  isLoggedIn,
  sectorFromUrl,
}: Props) {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [sector, setSector] = useState(sectorFromUrl ?? "");
  const [location, setLocation] = useState("");

  const locations = useMemo(() => getUniqueLocations(companies).filter(Boolean), [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (sector && c.sector !== sector) return false;
      if (location && c.location !== location) return false;
      return true;
    });
  }, [companies, sector, location]);

  return (
    <>
      <CompaniesFilters
        sector={sector}
        location={location}
        onSectorChange={setSector}
        onLocationChange={setLocation}
        sectors={SECTOR_OPTIONS}
        locations={locations}
      />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((company, i) => (
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
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-[var(--foreground)] opacity-80">
          No hay empresas con los filtros seleccionados. Prueba a cambiar sector o ubicación.
        </p>
      )}
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </>
  );
}
