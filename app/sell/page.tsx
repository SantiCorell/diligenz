"use client";

import { useState } from "react";
import Link from "next/link";
import ShellLayout from "@/components/layout/ShellLayout";
import { Mail, Phone, Building2, MapPin, BarChart3, Users, FileText } from "lucide-react";

type ValuationResult = {
  minValue: number;
  maxValue: number;
};

const SECTORS = [
  { value: "", label: "Selecciona un sector" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "salud", label: "Salud" },
  { value: "industria", label: "Industria" },
  { value: "consumo", label: "Consumo y retail" },
  { value: "hosteleria", label: "Hostelería" },
  { value: "servicios", label: "Servicios" },
  { value: "energia", label: "Energía" },
  { value: "logistica", label: "Logística" },
];

export default function SellPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [revenue, setRevenue] = useState<string>("");
  const [ebitda, setEbitda] = useState<string>("");
  const [employees, setEmployees] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const emailTrim = email.trim();
    const phoneTrim = phone.trim();

    if (!emailTrim) {
      setError("El correo electrónico es obligatorio para recibir la valoración.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Indica un correo electrónico válido.");
      return;
    }
    if (!phoneTrim) {
      setError("El teléfono es obligatorio para recibir la valoración.");
      return;
    }
    if (phoneTrim.replace(/\D/g, "").length < 9) {
      setError("Indica un teléfono válido (mínimo 9 dígitos).");
      return;
    }
    if (!sector || !location || !revenue || Number(revenue) <= 0) {
      setError("Completa al menos sector, ubicación y facturación anual.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrim,
          phone: phoneTrim,
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

  const inputClass =
    "mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/15 bg-white px-4 py-3 text-[var(--foreground)] placeholder:opacity-50 focus:border-[var(--brand-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition";
  const labelClass = "block text-sm font-semibold text-[var(--brand-primary)]";

  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-primary)]/10 py-12 md:py-14">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <span className="inline-block text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-90 mb-2">
              Valoración orientativa
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brand-primary)]">
              Valora tu empresa en minutos
            </h1>
            <p className="mt-3 text-[var(--foreground)] opacity-85 leading-relaxed">
              Obtén un rango orientativo basado en múltiplos de mercado. Para enviarte el resultado necesitamos tu correo y teléfono. Es confidencial y no conlleva compromiso.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-6 md:p-8 shadow-lg">
              <form onSubmit={submit} className="space-y-8">
                {/* Contacto (obligatorio para recibir valoración) */}
                <div>
                  <h2 className="text-lg font-bold text-[var(--brand-primary)] mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Datos de contacto
                  </h2>
                  <p className="text-sm text-[var(--foreground)] opacity-80 mb-4">
                    Sin correo y teléfono no podemos enviarte la valoración orientativa.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Correo electrónico <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-primary)]/50" />
                        <input
                          id="email"
                          type="email"
                          className={`${inputClass} pl-10`}
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-primary)]/50" />
                        <input
                          id="phone"
                          type="tel"
                          className={`${inputClass} pl-10`}
                          placeholder="600 000 000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos de la empresa */}
                <div>
                  <h2 className="text-lg font-bold text-[var(--brand-primary)] mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Datos de la empresa
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="companyName" className={labelClass}>
                        Nombre de la empresa
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        className={inputClass}
                        placeholder="Ej. Mi Empresa S.L."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="sector" className={labelClass}>
                        Sector <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="sector"
                        className={inputClass}
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                      >
                        {SECTORS.map((s) => (
                          <option key={s.value} value={s.value} disabled={s.value === ""}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="location" className={labelClass}>
                        Ubicación <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-primary)]/50" />
                        <input
                          id="location"
                          type="text"
                          className={`${inputClass} pl-10`}
                          placeholder="Ciudad o comunidad"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="revenue" className={labelClass}>
                        Facturación anual (€) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-primary)]/50" />
                        <input
                          id="revenue"
                          type="number"
                          min={1}
                          className={`${inputClass} pl-10`}
                          placeholder="Ej. 500 000"
                          value={revenue}
                          onChange={(e) => setRevenue(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ebitda" className={labelClass}>
                        EBITDA (€) <span className="text-sm font-normal opacity-70">(opcional)</span>
                      </label>
                      <input
                        id="ebitda"
                        type="number"
                        min={0}
                        className={inputClass}
                        placeholder="Ej. 80 000"
                        value={ebitda}
                        onChange={(e) => setEbitda(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="employees" className={labelClass}>
                        Empleados <span className="text-sm font-normal opacity-70">(opcional)</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-primary)]/50" />
                        <input
                          id="employees"
                          type="number"
                          min={0}
                          className={`${inputClass} pl-10`}
                          placeholder="Ej. 10"
                          value={employees}
                          onChange={(e) => setEmployees(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className={`${labelClass} flex items-center gap-2`}>
                        <FileText className="w-4 h-4" />
                        Descripción de la actividad <span className="text-sm font-normal opacity-70">(opcional)</span>
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        className={inputClass}
                        placeholder="Actividad, puntos fuertes y motivo de venta. Ayuda a afinar la valoración."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[var(--brand-primary)] py-4 text-base font-semibold text-white hover:opacity-95 disabled:opacity-60 transition shadow-md"
                >
                  {loading ? "Calculando valoración…" : "Ver valoración orientativa"}
                </button>
              </form>
            </div>

            {result && (
              <div className="mt-8 rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-6 md:p-8 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                    Resultado
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--brand-primary)]">
                  Valoración orientativa
                </h2>
                <p className="mt-2 text-[var(--foreground)] opacity-85 text-sm">
                  Basada en múltiplos de mercado y los datos indicados. Es <strong>orientativa</strong> y no sustituye una valoración profesional.
                </p>
                <div className="mt-6 rounded-xl bg-[var(--brand-bg-lavender)]/80 border border-[var(--brand-primary)]/15 p-6">
                  <p className="text-sm font-semibold text-[var(--brand-primary)] opacity-90 mb-1">
                    Rango estimado
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
                    {result.minValue.toLocaleString("es-ES")} € – {result.maxValue.toLocaleString("es-ES")} €
                  </p>
                </div>
                <p className="mt-4 text-xs text-[var(--foreground)] opacity-70">
                  La valoración definitiva depende de due diligence, documentación y condiciones de mercado.
                </p>
                <div className="mt-6 pt-6 border-t border-[var(--brand-primary)]/15">
                  <p className="text-[var(--foreground)] font-medium mb-3">
                    ¿Quieres una valoración profesional por parte de nuestros expertos?
                  </p>
                  <Link
                    href="/servicios#pricing"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
                  >
                    Ver servicios y precios →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </ShellLayout>
  );
}
