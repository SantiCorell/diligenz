"use client";

import { useState } from "react";
import Link from "next/link";
import ShellLayout from "@/components/layout/ShellLayout";
import { Mail, Phone, Building2, MapPin, BarChart3, Users, FileText, Globe, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { authFetch } from "@/lib/auth-client";

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

const COMPANY_TYPES = [
  { value: "", label: "No especificado" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "STARTUP", label: "Startup" },
  { value: "MARKETPLACE", label: "Marketplace" },
];

const STAGES = [
  { value: "", label: "No especificado" },
  { value: "idea", label: "Idea / pre-producto" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "serie_a", label: "Serie A" },
  { value: "serie_b", label: "Serie B" },
  { value: "growth", label: "Growth" },
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
  const [companyType, setCompanyType] = useState<string>("");
  const [yearsOperating, setYearsOperating] = useState<string>("");
  const [revenueGrowthPercent, setRevenueGrowthPercent] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [takeRatePercent, setTakeRatePercent] = useState<string>("");
  const [arr, setArr] = useState<string>("");
  const [hasReceivedFunding, setHasReceivedFunding] = useState<boolean | null>(null);
  const [website, setWebsite] = useState<string>("");
  const [description, setDescription] = useState("");
  const [showOptional, setShowOptional] = useState(false);
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
      const res = await authFetch("/api/valuation", {
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
          companyType: companyType || undefined,
          yearsOperating: yearsOperating === "" ? undefined : Number(yearsOperating),
          revenueGrowthPercent: revenueGrowthPercent === "" ? undefined : Number(revenueGrowthPercent),
          stage: stage || undefined,
          takeRatePercent: takeRatePercent === "" ? undefined : Number(takeRatePercent),
          arr: arr === "" ? undefined : Number(arr),
          hasReceivedFunding: hasReceivedFunding === null ? undefined : hasReceivedFunding,
          website: website.trim() || undefined,
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
    "mt-1.5 w-full rounded-xl border-2 border-[var(--brand-primary)]/15 bg-white px-4 py-3 text-[var(--foreground)] placeholder:opacity-50 focus:border-[var(--brand-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition placeholder:text-[var(--foreground)]/40";
  const labelClass = "block text-sm font-semibold text-[var(--brand-primary)]";
  const sectionTitleClass = "text-base font-bold text-[var(--brand-primary)] flex items-center gap-2";
  const optionalBadge = <span className="text-xs font-normal text-[var(--foreground)]/60 normal-case">(opcional)</span>;

  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        {/* Hero: más compacto en móvil */}
        <section className="border-b border-[var(--brand-primary)]/10 py-6 px-4 sm:py-8 sm:px-6 md:py-10">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-90 mb-2">
              Valoración orientativa
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--brand-primary)] tracking-tight">
              Valora tu empresa en minutos
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-85 leading-relaxed max-w-xl">
              Rango orientativo según múltiplos de mercado. Te lo enviamos por correo — confidencial y sin compromiso.
            </p>
          </div>
        </section>

        {/* Formulario: padding adaptado móvil/escritorio */}
        <section className="py-4 px-4 sm:py-6 sm:px-6 md:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl sm:rounded-2xl border border-[var(--brand-primary)]/12 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
              <p className="text-xs text-[var(--foreground)]/65 mb-5">
                Los campos marcados con <span className="text-red-500 font-medium">*</span> son obligatorios.
              </p>
              <form onSubmit={submit} className="space-y-0">
                {/* Contacto — bloque blanco */}
                <div className="pb-6 mb-6 border-b border-[var(--brand-primary)]/10">
                  <h2 className={`${sectionTitleClass} text-[var(--brand-dark)]`}>
                    <Mail className="w-4 h-4 shrink-0 text-[var(--brand-primary)]" />
                    Datos de contacto
                  </h2>
                  <p className="text-sm text-[var(--foreground)]/70 mt-1 mb-4">
                    Para enviarte el resultado por correo.
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
                          autoComplete="email"
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
                          autoComplete="tel"
                          className={`${inputClass} pl-10`}
                          placeholder="600 000 000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos de la empresa — bloque blanco */}
                <div className="pb-6 mb-6 border-b border-[var(--brand-primary)]/10">
                  <h2 className={`${sectionTitleClass} text-[var(--brand-dark)]`}>
                    <Building2 className="w-4 h-4 shrink-0 text-[var(--brand-primary)]" />
                    Datos de la empresa
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="companyName" className={labelClass}>Nombre de la empresa {optionalBadge}</label>
                      <input
                        id="companyName"
                        type="text"
                        className={inputClass}
                        placeholder="Ej. Mi Empresa S.L."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="website" className={labelClass}>Página web {optionalBadge}</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-primary)]/50" />
                        <input
                          id="website"
                          type="url"
                          className={`${inputClass} pl-10`}
                          placeholder="https://www.ejemplo.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="companyType" className={labelClass}>Tipo de entidad {optionalBadge}</label>
                      <select
                        id="companyType"
                        className={inputClass}
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                      >
                        {COMPANY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sector" className={labelClass}>Sector <span className="text-red-500">*</span></label>
                      <select
                        id="sector"
                        className={inputClass}
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                      >
                        {SECTORS.map((s) => (
                          <option key={s.value} value={s.value} disabled={s.value === ""}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="location" className={labelClass}>Ubicación <span className="text-red-500">*</span></label>
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
                      <label htmlFor="revenue" className={labelClass}>Facturación anual (€) <span className="text-red-500">*</span></label>
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
                      <p className="mt-1 text-xs text-[var(--foreground)]/60">Ingresos del último ejercicio.</p>
                    </div>
                    <div>
                      <label htmlFor="ebitda" className={labelClass}>EBITDA (€) {optionalBadge}</label>
                      <input
                        id="ebitda"
                        type="number"
                        className={inputClass}
                        placeholder="Ej. 80 000 o -20 000"
                        value={ebitda}
                        onChange={(e) => setEbitda(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-[var(--foreground)]/60">Puede ser negativo.</p>
                    </div>
                  </div>

                  {/* Campos condicionales por tipo (siempre visibles si aplican) */}
                  {companyType === "STARTUP" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--brand-primary)]/10">
                      <div>
                        <label htmlFor="stage" className={labelClass}>Etapa {optionalBadge}</label>
                        <select id="stage" className={inputClass} value={stage} onChange={(e) => setStage(e.target.value)}>
                          {STAGES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-[var(--brand-primary)]/15 bg-white p-4 self-end">
                        <input
                          type="checkbox"
                          id="hasReceivedFunding"
                          checked={hasReceivedFunding === true}
                          onChange={(e) => setHasReceivedFunding(e.target.checked)}
                          className="h-4 w-4 rounded border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
                        />
                        <label htmlFor="hasReceivedFunding" className="text-sm font-medium text-[var(--foreground)]">
                          Ha recibido financiación
                        </label>
                      </div>
                    </div>
                  )}
                  {companyType === "MARKETPLACE" && (
                    <div className="mt-4 pt-4 border-t border-[var(--brand-primary)]/10">
                      <label htmlFor="takeRatePercent" className={labelClass}>Take rate / comisión (%) {optionalBadge}</label>
                      <input
                        id="takeRatePercent"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        className={`${inputClass} max-w-[8rem]`}
                        placeholder="Ej. 15"
                        value={takeRatePercent}
                        onChange={(e) => setTakeRatePercent(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Bloque opcional colapsable — botón estilo Dili */}
                <div className="rounded-xl overflow-hidden border-2 border-[var(--brand-primary)]/20 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowOptional(!showOptional)}
                    className="w-full flex items-center justify-between gap-2 px-5 py-4 text-left text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/5 border-b border-[var(--brand-primary)]/10 transition font-semibold"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10">
                        <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
                      </span>
                      Más datos para afinar la valoración
                      <span className="text-xs font-normal text-[var(--foreground)]/60 normal-case">(opcional)</span>
                    </span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 shrink-0">
                      {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {showOptional && (
                    <div className="p-5 pt-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="yearsOperating" className={labelClass}>Años operando</label>
                        <input
                          id="yearsOperating"
                          type="number"
                          min={0}
                          className={inputClass}
                          placeholder="Ej. 5"
                          value={yearsOperating}
                          onChange={(e) => setYearsOperating(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="revenueGrowthPercent" className={labelClass}>Crecimiento facturación (%)</label>
                        <input
                          id="revenueGrowthPercent"
                          type="number"
                          className={inputClass}
                          placeholder="Ej. 50"
                          value={revenueGrowthPercent}
                          onChange={(e) => setRevenueGrowthPercent(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="arr" className={labelClass}>ARR (€)</label>
                        <input
                          id="arr"
                          type="number"
                          min={0}
                          className={inputClass}
                          placeholder="Ingresos recurrentes anuales"
                          value={arr}
                          onChange={(e) => setArr(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="employees" className={labelClass}>Empleados</label>
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
                          Descripción de la actividad
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          className={inputClass}
                          placeholder="Actividad, puntos fuertes y motivo de venta."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2 mt-6" role="alert">
                    <span className="shrink-0 mt-0.5">⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-6 sm:mt-8 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-4 min-h-[48px] sm:min-h-[52px] text-base font-bold bg-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary)]/25 hover:shadow-xl hover:shadow-[var(--brand-primary)]/30 hover:opacity-95 disabled:opacity-60 transition flex items-center justify-center gap-2.5 touch-manipulation"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                        Calculando valoración…
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 shrink-0" />
                        Ver valoración orientativa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {result && (
              <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-4 sm:p-6 md:p-8 shadow-md shadow-[var(--brand-primary)]/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                    Resultado
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--brand-primary)]">
                  Valoración orientativa
                </h2>
                <p className="mt-2 text-[var(--foreground)]/80 text-sm">
                  Basada en múltiplos de mercado y los datos indicados. Es <strong>orientativa</strong> y no sustituye una valoración profesional.
                </p>
                <div className="mt-4 sm:mt-6 rounded-xl bg-white border-2 border-[var(--brand-primary)]/15 p-4 sm:p-6">
                  <p className="text-sm font-semibold text-[var(--brand-primary)]/90 mb-1">
                    Rango estimado
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--brand-primary)] tracking-tight break-all">
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
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
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
