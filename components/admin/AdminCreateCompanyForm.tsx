"use client";

import { useState } from "react";
import UserOwnerSearch from "./UserOwnerSearch";

export default function AdminCreateCompanyForm() {
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
              Nombre empresa
            </label>
            <input
              required
              type="text"
              name="name"
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Sector
            </label>
            <input
              required
              type="text"
              name="sector"
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Ubicación
            </label>
            <input
              required
              type="text"
              name="location"
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
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
