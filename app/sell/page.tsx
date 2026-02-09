"use client";

import { useState } from "react";
import Link from "next/link";
import ShellLayout from "@/components/layout/ShellLayout";

type ValuationResult = {
  minValue: number;
  maxValue: number;
};

const SECTORS = [
  { value: "", label: "Selecciona un sector" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "salud", label: "Salud" },
  { value: "industria", label: "Industria" },
  { value: "consumo", label: "Consumo & Retail" },
  { value: "hosteleria", label: "Hostelería" },
  { value: "servicios", label: "Servicios" },
];

export default function SellPage() {
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [revenue, setRevenue] = useState<number | "">("");
  const [ebitda, setEbitda] = useState<number | "">("");
  const [employees, setEmployees] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!sector || !location || !revenue) {
      setError("Completa al menos sector, ubicación y facturación anual.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim() || undefined,
          description: description.trim() || undefined,
          sector,
          location,
          revenue: Number(revenue),
          ebitda: ebitda === "" ? null : Number(ebitda),
          employees: employees === "" ? null : Number(employees),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo calcular la valoración.");
        return;
      }
      setResult(data);
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShellLayout>
    <div className="min-h-screen bg-[var(--brand-bg)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-primary)]">
          Valora tu empresa en minutos
        </h1>
        <p className="mt-2 text-gray-600">
          Obtén un rango orientativo y empieza un proceso privado y seguro.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-2xl border border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] p-8 shadow-sm"
        >
          {/* DATOS EMPRESA */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Nombre de la empresa</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border px-4 py-3"
                placeholder="Ej. Mi Empresa S.L."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sector</label>
              <select
                className="mt-1 w-full rounded-lg border px-4 py-3 bg-white"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {SECTORS.map((s) => (
                  <option
                    key={s.value}
                    value={s.value}
                    disabled={s.value === ""}
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Ubicación</label>
              <input
                className="mt-1 w-full rounded-lg border px-4 py-3"
                placeholder="España, Madrid…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Facturación anual (€)
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-4 py-3"
                placeholder="500000"
                value={revenue}
                onChange={(e) =>
                  setRevenue(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                EBITDA (€){" "}
                <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-4 py-3"
                placeholder="80000"
                value={ebitda}
                onChange={(e) =>
                  setEbitda(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Empleados{" "}
                <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border px-4 py-3"
                placeholder="10"
                value={employees}
                onChange={(e) =>
                  setEmployees(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">
                Descripción de la actividad{" "}
                <span className="text-gray-400">(opcional, recomendado)</span>
              </label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border px-4 py-3"
                placeholder="Describe brevemente la actividad, sector, puntos fuertes y motivo de venta. Así la ficha será más atractiva para compradores."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--brand-primary)] py-3 text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Calculando…" : "Ver valoración orientativa"}
          </button>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl bg-[var(--brand-bg-lavender)] border border-[var(--brand-primary)]/20 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--brand-primary)]">
              Valoración orientativa
            </h2>
            <p className="mt-2 text-[var(--foreground)] opacity-85">
              Basada en múltiplos de mercado y los datos que has indicado. Este resultado es
              <strong> orientativo</strong> y no sustituye una valoración profesional.
            </p>
            <div className="mt-4 text-3xl font-bold text-[var(--brand-primary)]">
              {result.minValue.toLocaleString("es-ES")} € –{" "}
              {result.maxValue.toLocaleString("es-ES")} €
            </div>
            <p className="mt-3 text-sm text-[var(--foreground)] opacity-75">
              *La valoración definitiva depende de due diligence, documentación y condiciones de mercado.
            </p>
            <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/20">
              <p className="text-[var(--foreground)] font-medium mb-2">
                ¿Quiere recibir una valoración profesional realizada por nuestros expertos?
              </p>
              <Link
                href="/servicios#pricing"
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-white text-sm font-medium hover:opacity-90"
              >
                Ver servicios y precios →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
    </ShellLayout>
  );
}
