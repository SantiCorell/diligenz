"use client";

import { useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronDown } from "lucide-react";
import { trackContact } from "@/lib/meta-pixel";

type ServiceId = "dd" | "val" | "rev" | "spa";
type AreaId = "fin" | "fis" | "lab" | "leg";
type StepId = "service" | "scope" | "reach" | "urgency" | "price" | "contact";

const AREA_BASE: Record<AreaId, number> = {
  fin: 18000,
  fis: 10000,
  lab: 8000,
  leg: 12000,
};

const AREAS: { id: AreaId; label: string }[] = [
  { id: "leg", label: "Legal" },
  { id: "fis", label: "Fiscal" },
  { id: "lab", label: "Laboral" },
  { id: "fin", label: "Financiera" },
];

const SERVICE_LABELS: Record<ServiceId, string> = {
  dd: "Due diligence",
  val: "Valoración profesional",
  rev: "Documento / contrato cerrado",
  spa: "Redacción / revisión SPA",
};

const EMPLOYEE_OPTIONS = [
  { value: 0.85, label: "Hasta 10 empleados" },
  { value: 1, label: "11 – 25 empleados" },
  { value: 1.25, label: "26 – 75 empleados" },
  { value: 1.55, label: "Más de 75 empleados" },
];

const SIZE_OPTIONS = [
  { value: 0.7, label: "Hasta 500 K€" },
  { value: 1, label: "500 K€ – 2 M€" },
  { value: 1.35, label: "2 M€ – 7 M€" },
  { value: 1.7, label: "7 M€ – 10 M€" },
];

const DOC_OPTIONS = [
  { value: 300, label: "Constitución de SL" },
  { value: 600, label: "Contrato mercantil tipo" },
  { value: 1500, label: "Pacto de socios estándar" },
  { value: 900, label: "Valoración orientativa plus" },
];

function fmt(n: number) {
  return `${n.toLocaleString("es-ES")} €`;
}

function round50(n: number) {
  return Math.round(n / 50) * 50;
}

const selectClass =
  "w-full cursor-pointer appearance-none rounded-xl border border-[#cfc8dd] bg-white py-3 pl-3.5 pr-10 text-sm text-[var(--brand-dark)] outline-none transition hover:border-[var(--brand-primary)]/45 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15";
const inputClass =
  "w-full rounded-xl border border-[#cfc8dd] bg-white px-3.5 py-3 text-sm text-[var(--brand-dark)] placeholder:text-[var(--foreground)]/40 outline-none transition hover:border-[var(--brand-primary)]/45 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-dark)]/70";

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-primary)]"
        strokeWidth={2.25}
        aria-hidden
      />
    </div>
  );
}

type GuideStep = {
  id: StepId;
  title: string;
  hint: string;
  value: string | null;
  done: boolean;
  active: boolean;
};

function StepGuide({ steps }: { steps: GuideStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-dark)]/55">
          Progreso
        </p>
        <p className="text-xs font-bold text-[var(--brand-primary)]">{progress}%</p>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[var(--brand-primary)]/12">
        <div
          className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                step.done
                  ? "bg-[var(--brand-primary)] text-white"
                  : step.active
                    ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/35"
                    : "bg-white text-[var(--brand-dark)]/30 ring-1 ring-[var(--brand-dark)]/10"
              }`}
            >
              {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <p
              className={`w-[5rem] shrink-0 truncate text-sm font-semibold transition-colors ${
                step.done || step.active
                  ? "text-[var(--brand-dark)]"
                  : "text-[var(--brand-dark)]/30"
              }`}
            >
              {step.title}
            </p>
            <p
              className={`min-w-0 flex-1 truncate text-sm transition-colors ${
                step.done
                  ? "font-medium text-[var(--brand-primary)]"
                  : step.active
                    ? "text-[var(--brand-dark)]/55"
                    : "text-[var(--brand-dark)]/25"
              }`}
            >
              {step.done && step.value
                ? step.value
                : step.active
                  ? step.hint
                  : "—"}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function BudgetCalculator({
  initialArea,
}: {
  initialArea?: AreaId | null;
}) {
  const [service, setService] = useState<ServiceId>("dd");
  const [areas, setAreas] = useState<AreaId[]>(() => {
    if (initialArea) return [initialArea];
    return ["leg", "fis"];
  });
  const [size, setSize] = useState(1);
  const [employees, setEmployees] = useState(1);
  const [docPrice, setDocPrice] = useState(600);
  const [urgency, setUrgency] = useState(1);

  const [touched, setTouched] = useState({
    service: false,
    scope: Boolean(initialArea),
    size: false,
    employees: false,
    urgency: false,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showScopeFields = service === "dd" || service === "val" || service === "spa";
  const mark = (key: keyof typeof touched) =>
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const priceRange = useMemo(() => {
    let base = 0;
    if (service === "dd") {
      if (areas.length === 0) return null;
      base = areas.reduce((sum, a) => sum + AREA_BASE[a], 0);
      if (areas.length >= 3) base *= 0.85;
      base *= size * employees;
    } else if (service === "val") {
      base = 3500 * size * (0.9 + employees * 0.1);
    } else if (service === "spa") {
      base = 11000 * (0.8 + size * 0.4) * (0.95 + employees * 0.05);
    } else {
      base = docPrice;
    }
    base *= urgency;
    return { lo: round50(base * 0.9), hi: round50(base * 1.2) };
  }, [service, areas, size, employees, docPrice, urgency]);

  const priceLabel = priceRange
    ? `${fmt(priceRange.lo)} – ${fmt(priceRange.hi)}`
    : "Selecciona al menos un área";

  const sizeLabel = SIZE_OPTIONS.find((s) => s.value === size)?.label ?? "";
  const empLabel = EMPLOYEE_OPTIONS.find((e) => e.value === employees)?.label ?? "";
  const docLabel = DOC_OPTIONS.find((d) => d.value === docPrice)?.label ?? "";
  const areaLabels = areas
    .map((a) => AREAS.find((x) => x.id === a)?.label ?? a)
    .join(", ");

  const scopeDone =
    service === "dd"
      ? touched.scope && areas.length > 0
      : service === "rev"
        ? touched.scope
        : true;
  const reachDone = showScopeFields ? touched.size && touched.employees : true;
  const serviceDone = touched.service;
  const urgencyDone = touched.urgency;
  const priceDone =
    Boolean(priceRange) && serviceDone && scopeDone && reachDone && urgencyDone;
  const contactDone =
    showLeadForm &&
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.replace(/\D/g, "").length >= 9;

  const guideSteps: GuideStep[] = useMemo(() => {
    const scopeValue =
      service === "dd"
        ? areaLabels || null
        : service === "rev"
          ? docLabel
          : "No aplica";
    const reachValue = showScopeFields ? `${sizeLabel} · ${empLabel}` : "No aplica";

    const defs: Omit<GuideStep, "active">[] = [
      {
        id: "service",
        title: "Servicio",
        hint: "Elige →",
        value: SERVICE_LABELS[service],
        done: serviceDone,
      },
      {
        id: "scope",
        title: service === "dd" ? "Áreas" : service === "rev" ? "Documento" : "Alcance",
        hint: "Selecciona →",
        value: scopeValue,
        done: scopeDone,
      },
      {
        id: "reach",
        title: "Empresa",
        hint: "Datos →",
        value: reachValue,
        done: reachDone,
      },
      {
        id: "urgency",
        title: "Plazo",
        hint: "Elige →",
        value: urgency === 1.25 ? "Urgente" : "Estándar",
        done: urgencyDone,
      },
      {
        id: "price",
        title: "Precio",
        hint: "Horquilla",
        value: priceRange ? priceLabel : null,
        done: priceDone,
      },
      {
        id: "contact",
        title: "Contacto",
        hint: "Datos →",
        value: contactDone
          ? "Listo"
          : showLeadForm
            ? "Rellena →"
            : null,
        done: contactDone,
      },
    ];

    const firstPending = defs.findIndex((s) => !s.done);
    return defs.map((s, i) => ({
      ...s,
      active: firstPending === -1 ? i === defs.length - 1 : i === firstPending,
    }));
  }, [
    service,
    serviceDone,
    scopeDone,
    reachDone,
    urgencyDone,
    priceDone,
    contactDone,
    showLeadForm,
    areaLabels,
    docLabel,
    sizeLabel,
    empLabel,
    showScopeFields,
    urgency,
    priceRange,
    priceLabel,
  ]);

  const toggleArea = (id: AreaId) => {
    mark("scope");
    setAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const buildLeadMessage = () => {
    const lines = [
      `Servicio: ${SERVICE_LABELS[service]}`,
      service === "dd" ? `Áreas: ${areaLabels}` : null,
      service === "rev" ? `Documento: ${docLabel}` : null,
      showScopeFields ? `Facturación: ${sizeLabel}` : null,
      showScopeFields ? `Empleados: ${empLabel}` : null,
      `Plazo: ${urgency === 1.25 ? "Urgente (<10 días)" : "Estándar"}`,
      `Precio orientativo: ${priceLabel}`,
    ];
    return lines.filter(Boolean).join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!priceRange) {
      setError("Selecciona al menos un área para obtener el precio.");
      return;
    }

    const nameTrim = name.trim();
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();

    if (nameTrim.length < 2) {
      setError("Indica tu nombre completo.");
      return;
    }
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setError("Indica un correo electrónico válido.");
      return;
    }
    if (!phoneTrim || phoneTrim.replace(/\D/g, "").length < 9) {
      setError("Indica un teléfono válido (mínimo 9 dígitos).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "servicios",
          type: "PARTICULAR",
          name: nameTrim,
          email: emailTrim,
          phone: phoneTrim,
          subject: `Presupuesto servicios: ${SERVICE_LABELS[service]} · ${priceLabel}`,
          message: buildLeadMessage(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }
      trackContact({ source: "servicios", type: service });
      setSent(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white px-6 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
          <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
        </div>
        <p className="mt-4 text-xl font-bold text-[var(--brand-dark)]">Solicitud enviada</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--foreground)]/70">
          Presupuesto orientativo de{" "}
          <span className="font-semibold text-[var(--brand-primary)]">{priceLabel}</span>.
          Te contactamos en menos de 24 h.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-[var(--brand-primary)]/15 bg-[var(--brand-surface)] shadow-[0_16px_48px_-20px_rgba(145,70,255,0.28)]">
      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        {/* Left guide */}
        <aside className="border-b border-[var(--brand-primary)]/10 bg-[#f4f1f8] px-6 py-6 lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Presupuesto instantáneo
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-[var(--brand-dark)]">
            Tu presupuesto, al instante
          </h2>
          <p className="mt-2 text-sm text-[var(--brand-dark)]/55">
            Completa el formulario: la guía se actualiza sola.
          </p>
          <StepGuide steps={guideSteps} />
        </aside>

        {/* Right form */}
        <div className="bg-white px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="q-service" className={labelClass}>
                Servicio
              </label>
              <SelectWrap>
                <select
                  id="q-service"
                  value={service}
                  onChange={(e) => {
                    mark("service");
                    const next = e.target.value as ServiceId;
                    setService(next);
                    if (next !== "dd" && next !== "rev") {
                      setTouched((t) => ({ ...t, scope: true }));
                    }
                  }}
                  onFocus={() => mark("service")}
                  className={selectClass}
                >
                  {(Object.keys(SERVICE_LABELS) as ServiceId[]).map((id) => (
                    <option key={id} value={id}>
                      {SERVICE_LABELS[id]}
                    </option>
                  ))}
                </select>
              </SelectWrap>
            </div>

            {service === "dd" && (
              <div>
                <p className={labelClass}>Áreas a revisar</p>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((a) => {
                    const on = areas.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleArea(a.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          on
                            ? "bg-[var(--brand-primary)] text-white"
                            : "border border-[#cfc8dd] bg-white text-[var(--brand-dark)] hover:border-[var(--brand-primary)]/45"
                        }`}
                      >
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showScopeFields && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="q-size" className={labelClass}>
                    Facturación
                  </label>
                  <SelectWrap>
                    <select
                      id="q-size"
                      value={size}
                      onChange={(e) => {
                        mark("size");
                        setSize(parseFloat(e.target.value));
                      }}
                      onFocus={() => mark("size")}
                      className={selectClass}
                    >
                      {SIZE_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label htmlFor="q-employees" className={labelClass}>
                    Empleados
                  </label>
                  <SelectWrap>
                    <select
                      id="q-employees"
                      value={employees}
                      onChange={(e) => {
                        mark("employees");
                        setEmployees(parseFloat(e.target.value));
                      }}
                      onFocus={() => mark("employees")}
                      className={selectClass}
                    >
                      {EMPLOYEE_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label htmlFor="q-urgency" className={labelClass}>
                    Plazo
                  </label>
                  <SelectWrap>
                    <select
                      id="q-urgency"
                      value={urgency}
                      onChange={(e) => {
                        mark("urgency");
                        setUrgency(parseFloat(e.target.value));
                      }}
                      onFocus={() => mark("urgency")}
                      className={selectClass}
                    >
                      <option value={1}>Estándar</option>
                      <option value={1.25}>Urgente (&lt;10 días)</option>
                    </select>
                  </SelectWrap>
                </div>
              </div>
            )}

            {service === "rev" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="q-doc" className={labelClass}>
                    Tipo de documento
                  </label>
                  <SelectWrap>
                    <select
                      id="q-doc"
                      value={docPrice}
                      onChange={(e) => {
                        mark("scope");
                        setDocPrice(parseFloat(e.target.value));
                      }}
                      onFocus={() => mark("scope")}
                      className={selectClass}
                    >
                      {DOC_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label htmlFor="q-urgency-rev" className={labelClass}>
                    Plazo
                  </label>
                  <SelectWrap>
                    <select
                      id="q-urgency-rev"
                      value={urgency}
                      onChange={(e) => {
                        mark("urgency");
                        setUrgency(parseFloat(e.target.value));
                      }}
                      onFocus={() => mark("urgency")}
                      className={selectClass}
                    >
                      <option value={1}>Estándar</option>
                      <option value={1.25}>Urgente (&lt;10 días)</option>
                    </select>
                  </SelectWrap>
                </div>
              </div>
            )}

            {!showScopeFields && service !== "rev" && (
              <div>
                <label htmlFor="q-urgency-solo" className={labelClass}>
                  Plazo
                </label>
                <SelectWrap>
                  <select
                    id="q-urgency-solo"
                    value={urgency}
                    onChange={(e) => {
                      mark("urgency");
                      setUrgency(parseFloat(e.target.value));
                    }}
                    onFocus={() => mark("urgency")}
                    className={selectClass}
                  >
                    <option value={1}>Estándar</option>
                    <option value={1.25}>Urgente (&lt;10 días)</option>
                  </select>
                </SelectWrap>
              </div>
            )}

            {/* Price */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--brand-primary)]/15 bg-[#f4f1f8] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-dark)]/55">
                  Precio orientativo
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--brand-dark)] sm:text-3xl">
                  {priceLabel}
                </p>
                <p className="mt-1 text-xs text-[var(--brand-dark)]/50">
                  Sin compromiso · Confirmación en 24 h
                </p>
              </div>
              {!showLeadForm && (
                <button
                  type="button"
                  disabled={!priceRange}
                  onClick={() => {
                    setError(null);
                    setShowLeadForm(true);
                  }}
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Solicitar propuesta →
                </button>
              )}
            </div>

            {showLeadForm && (
              <div className="space-y-3 rounded-2xl border border-[var(--brand-primary)]/12 bg-[#f4f1f8]/80 p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-dark)]/55">
                  Tus datos para la propuesta
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="q-name" className={labelClass}>
                      Nombre completo *
                    </label>
                    <input
                      id="q-name"
                      type="text"
                      autoComplete="name"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre y apellidos"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="q-email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="q-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="q-phone" className={labelClass}>
                      Teléfono *
                    </label>
                    <input
                      id="q-phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="600 000 000"
                      className={inputClass}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !priceRange}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Enviando…" : "Enviar propuesta →"}
                </button>
              </div>
            )}

            {!showLeadForm && error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
