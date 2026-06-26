"use client";

import { useState } from "react";
import UserOwnerSearch from "./UserOwnerSearch";
import SectorSelect from "@/components/forms/SectorSelect";
import CcaaSelect from "@/components/forms/CcaaSelect";
import type { SectorOption } from "@/lib/valuation-sectors";

type Props = {
  sectorOptions: SectorOption[];
};

export default function AdminCreateCompanyForm({ sectorOptions }: Props) {
  const [ownerError, setOwnerError] = useState(false);

  return (
    <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 mb-10">
      <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
        Crear empresa y asignar a un usuario
      </h2>
      <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
        Busca por nombre o email al usuario vendedor (o cualquier usuario) que será titular de la ficha.
        Se crea en borrador con valoración orientativa y deal interno sin publicar.
      </p>
      <form
        action="/api/admin/company/create"
        method="POST"
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          const fd = new FormData(e.currentTarget);
          const oid = fd.get("ownerId")?.toString()?.trim();
          if (!oid) {
            e.preventDefault();
            setOwnerError(true);
          } else {
            setOwnerError(false);
          }
        }}
      >
        <UserOwnerSearch initialUserId="" initialSummary="" />
        {ownerError && (
          <p className="text-sm text-red-600 font-medium">
            Elige un usuario en la lista antes de crear la empresa.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Nombre empresa (real)
            </label>
            <input
              required
              type="text"
              name="name"
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/40 px-4 py-3">
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-semibold text-[var(--brand-primary)]">Referencia automática: </span>
              <span className="font-mono">DIL-1001</span>, <span className="font-mono">DIL-1002</span>… Se asigna sola al crear la empresa.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Sector
            </label>
            <SectorSelect required options={sectorOptions} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Comunidad autónoma
            </label>
            <CcaaSelect required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Facturación anual (€)
            </label>
            <input
              required
              type="text"
              name="revenue"
              placeholder="ej. 500000 o 1,2M"
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              CNAE (opcional)
            </label>
            <input
              type="text"
              name="cnae"
              maxLength={10}
              placeholder="Ej. 6201"
              className="mt-2 w-full max-w-xs rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              EBITDA (€, opcional)
            </label>
            <input
              type="text"
              name="ebitda"
              className="mt-2 w-full max-w-md rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Resultado del ejercicio (opcional)
            </label>
            <input
              type="text"
              name="exerciseResult"
              placeholder="Beneficio neto último ejercicio"
              className="mt-2 w-full max-w-md rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-green-600 text-white shadow-lg hover:opacity-95 transition"
        >
          Crear empresa
        </button>
      </form>
    </section>
  );
}
