"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronDown,
  Clock,
  Globe,
  Hash,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import { ebitdaMultipleGuide } from "@/lib/compute-valuation-range";
import { formatCompactEuroRange } from "@/lib/format-financial";
import { SPAIN_CCAA_OPTIONS } from "@/lib/spain-ccaa";
import { VALUATION_SECTOR_OPTIONS, type SectorOption } from "@/lib/valuation-sectors";
import { trackValuationLead } from "@/lib/meta-pixel";

type ValuationResult = {
  minValue: number;
  maxValue: number;
};

const COMPANY_TYPES = [
  { value: "", label: "No especificado" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "AUTONOMO", label: "Profesional / Autónomo" },
];

const STEPS = [
  {
    label: "Su empresa",
    title: "Empecemos por lo esencial",
    lead: "Con estos datos situamos el negocio y sabemos a quién enviar el rango. Después pediremos las cifras.",
  },
  {
    label: "Datos financieros",
    title: "Las cifras del último ejercicio",
    lead: "La facturación abre el rango. El EBITDA y el resultado, si los tiene, lo hacen más preciso.",
  },
  {
    label: "Contexto",
    title: "Datos que afinan el rango",
    lead: "Todo este paso es opcional. Si no tiene un dato a mano, déjelo vacío: el cálculo sigue adelante.",
  },
] as const;

const FAQ = [
  {
    q: "¿Esta valoración es realmente gratuita?",
    a: "Sí. No tiene coste ni compromiso. Al terminar los pasos verá el rango en esta misma página.",
  },
  {
    q: "¿Qué ocurre con los datos que facilito?",
    a: "Sirven para calcular el rango y para que el equipo de Diligenz pueda atenderle si quiere seguir. No se publican en el marketplace y no se comparten con terceros.",
  },
  {
    q: "¿En qué se diferencia de una valoración profesional?",
    a: "Esto es una primera orientación a partir de las cifras que usted indica y de los múltiplos habituales de su sector. Una valoración profesional revisa documentación, deuda, contratos y la calidad de los ingresos.",
  },
  {
    q: "¿Cuándo recibiré el resultado?",
    a: "Al momento, en cuanto complete el último paso. El rango aparece en esta página.",
  },
  {
    q: "¿Me obliga esto a vender mi empresa?",
    a: "No. Es una referencia para decidir si quiere explorar una operación. Puede quedarse aquí.",
  },
];

type Props = {
  variant?: "public" | "dashboard";
  initialEmail?: string;
  initialPhone?: string;
  backHref?: string;
  eyebrow?: string;
  title?: string;
};

function formatMultiple(value: number): string {
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}x`;
}

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}{" "}
        {required ? (
          <span className="text-[#7c4dff]">*</span>
        ) : (
          <span className="font-normal text-slate-400">(opcional)</span>
        )}
      </label>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
      <div className="relative mt-2">{children}</div>
    </div>
  );
}

const controlClass =
  "w-full rounded-xl border border-[#d9c7ff] bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#7c4dff] focus:outline-none focus:ring-2 focus:ring-[#7c4dff]/15";

export default function SellValuationForm({
  variant = "public",
  initialEmail = "",
  initialPhone = "",
  backHref,
  eyebrow = "Valoración orientativa",
  title = "Subir empresa",
}: Props) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [sectorSubcategory, setSectorSubcategory] = useState("");
  const [location, setLocation] = useState("");
  const [revenue, setRevenue] = useState("");
  const [ebitda, setEbitda] = useState("");
  const [exerciseResult, setExerciseResult] = useState("");
  const [employees, setEmployees] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [yearsOperating, setYearsOperating] = useState("");
  const [revenueGrowthPercent, setRevenueGrowthPercent] = useState("");
  const [arr, setArr] = useState("");
  const [website, setWebsite] = useState("");
  const [cnae, setCnae] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>(VALUATION_SECTOR_OPTIONS);

  const isDashboard = variant === "dashboard";
  const multiples = ebitdaMultipleGuide();

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then((d: { options?: SectorOption[] }) => {
        if (d.options?.length) setSectorOptions(d.options);
      })
      .catch(() => {});
  }, []);

  const scrollToForm = () => {
    document.getElementById("valoracion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateStep = (index: number): string | null => {
    if (index === 0) {
      if (!sector) return "Seleccione el sector de actividad.";
      if (!location) return "Seleccione la comunidad autónoma.";
      const emailTrim = email.trim();
      if (!emailTrim) return "El correo electrónico es obligatorio.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) return "Indique un correo electrónico válido.";
      const phoneTrim = phone.trim();
      if (!phoneTrim) return "El teléfono es obligatorio.";
      if (phoneTrim.replace(/\D/g, "").length < 9) return "Indique un teléfono válido (mínimo 9 dígitos).";
    }
    if (index === 1) {
      if (!revenue || Number(revenue) <= 0) return "Indique la facturación anual del último ejercicio.";
      if (ebitda !== "" && !Number.isFinite(Number(ebitda))) return "El EBITDA tiene que ser un número. Puede ser negativo.";
      if (exerciseResult !== "" && !Number.isFinite(Number(exerciseResult))) {
        return "El resultado del ejercicio tiene que ser un número, o déjelo vacío.";
      }
    }
    return null;
  };

  const goNext = () => {
    const message = validateStep(step);
    setError(message);
    if (message) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    scrollToForm();
  };

  const goBack = () => {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
    scrollToForm();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    for (let index = 0; index < STEPS.length - 1; index += 1) {
      const message = validateStep(index);
      if (message) {
        setStep(index);
        setError(message);
        scrollToForm();
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          companyName: companyName.trim() || undefined,
          description: description.trim() || undefined,
          sector,
          sectorSubcategory: sectorSubcategory.trim() || undefined,
          location,
          revenue: Number(revenue),
          ebitda: ebitda === "" ? null : Number(ebitda),
          exerciseResult: exerciseResult === "" ? null : Number(exerciseResult),
          employees: employees === "" ? null : Number(employees),
          companyType: companyType || undefined,
          yearsOperating: yearsOperating === "" ? undefined : Number(yearsOperating),
          revenueGrowthPercent: revenueGrowthPercent === "" ? undefined : Number(revenueGrowthPercent),
          arr: arr === "" ? undefined : Number(arr),
          website: website.trim() || undefined,
          cnae: cnae.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo calcular la valoración.");
        return;
      }
      trackValuationLead({
        sector,
        location,
        value: typeof data.maxValue === "number" ? data.maxValue : undefined,
      });
      setResult(data);
      scrollToForm();
    } catch {
      setError("Error inesperado. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const current = STEPS[step];

  return (
    <div className={isDashboard ? "" : "bg-[#f7f6fb]"}>
      {!isDashboard && (
        <section className="px-4 pb-4 pt-12 text-center sm:px-6 sm:pt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c4dff]">
            Valoración orientativa · Gratuita
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Descubra cuánto podría valer su empresa
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            En pocos minutos y sin compromiso, obtenga un rango de valoración orientativo a partir de los
            múltiplos de mercado de su sector. Un primer punto de partida antes de decidir si quiere vender,
            buscar inversión o simplemente conocer la situación de su negocio.
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <li className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7c4dff]" aria-hidden />
              Rango al instante
            </li>
            <li className="inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#7c4dff]" aria-hidden />
              Según su sector
            </li>
            <li className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#7c4dff]" aria-hidden />
              Confidencial y sin compromiso
            </li>
          </ul>
          <button
            type="button"
            onClick={scrollToForm}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#7c4dff] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
          >
            Empezar mi valoración
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </section>
      )}

      <section id="valoracion" className={isDashboard ? "pb-8" : "scroll-mt-24 px-4 py-8 sm:px-6 sm:py-12"}>
        <div className={`mx-auto ${isDashboard ? "max-w-2xl" : "max-w-xl"}`}>
          {isDashboard && (
            <div className="mb-6">
              {backHref && (
                <Link href={backHref} className="text-sm font-medium text-[#7c4dff] hover:underline">
                  ← Volver a mis empresas
                </Link>
              )}
              <p className="page-eyebrow mt-3">{eyebrow}</p>
              <h1 className="page-title mt-2">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Los mismos datos de siempre, en tres pasos. El rango se calcula al final y, si tiene sesión,
                el proyecto queda guardado en sus empresas.
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            {result ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">Resultado</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Rango orientativo</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Banda calculada con el sector y las cifras que ha indicado. Es una primera orientación: no
                  sustituye una valoración profesional ni una due diligence.
                </p>
                <p className="mt-6 text-3xl font-bold tracking-tight text-[#5b34d6] sm:text-4xl">
                  {formatCompactEuroRange(result.minValue, result.maxValue)}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {backHref && (
                    <Link
                      href={backHref}
                      className="inline-flex items-center rounded-xl bg-[#7c4dff] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6b3df0]"
                    >
                      Ver mis empresas
                    </Link>
                  )}
                  <Link
                    href="/servicios"
                    className="inline-flex items-center rounded-xl border border-[#d9c7ff] px-5 py-3 text-sm font-semibold text-[#5b34d6] hover:bg-[#f7f2ff]"
                  >
                    Conocer el asesoramiento
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setStep(0);
                    }}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Calcular otra
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold text-[#7c4dff]">
                    Paso {step + 1} de {STEPS.length} · {current.label}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden>
                  {STEPS.map((item, index) => (
                    <span
                      key={item.label}
                      className={`h-1 rounded-full ${index <= step ? "bg-[#7c4dff]" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-900">{current.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{current.lead}</p>

                <div className="mt-6 space-y-5">
                  {step === 0 && (
                    <>
                      <Field
                        id="sector"
                        label="Sector de actividad"
                        required
                        hint="El múltiplo de partida depende de la actividad. Elija el grupo que mejor la describe."
                      >
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                        <select
                          id="sector"
                          className={`${controlClass} appearance-none pr-10`}
                          value={sector}
                          onChange={(event) => setSector(event.target.value)}
                        >
                          {sectorOptions.map((option) => (
                            <option key={option.value || "empty"} value={option.value} disabled={option.value === ""}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      </Field>
                      <Field
                        id="location"
                        label="Comunidad autónoma"
                        required
                        hint="Solo la comunidad. No pedimos la dirección y no se publica."
                      >
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                        <select
                          id="location"
                          className={`${controlClass} appearance-none pr-10`}
                          value={location}
                          onChange={(event) => setLocation(event.target.value)}
                        >
                          {SPAIN_CCAA_OPTIONS.map((option) => (
                            <option key={option.value || "empty"} value={option.value} disabled={option.value === ""}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      </Field>
                      <Field
                        id="companyName"
                        label="Nombre de la empresa"
                        hint="Confidencial. Si más adelante se publica una ficha, en la web se usa un nombre de proyecto, no este."
                      >
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                        <input
                          id="companyName"
                          type="text"
                          className={controlClass}
                          placeholder="Ej. Mi Empresa S.L."
                          value={companyName}
                          onChange={(event) => setCompanyName(event.target.value)}
                        />
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="email" label="Correo electrónico" required hint="Ahí queda asociada esta solicitud.">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className={controlClass}
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                          />
                        </Field>
                        <Field id="phone" label="Teléfono" required hint="Mínimo 9 dígitos, por si hay que comentarle el rango.">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                          <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            className={controlClass}
                            placeholder="600 000 000"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                          />
                        </Field>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Field
                        id="revenue"
                        label="Facturación anual"
                        required
                        hint="Ingresos del último ejercicio cerrado, en euros. Sin puntos de miles: 500000."
                      >
                        <TrendingUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                        <input
                          id="revenue"
                          type="number"
                          min={1}
                          className={controlClass}
                          placeholder="Ej. 500000"
                          value={revenue}
                          onChange={(event) => setRevenue(event.target.value)}
                        />
                      </Field>
                      <Field
                        id="ebitda"
                        label="EBITDA"
                        hint="Resultado antes de intereses, impuestos y amortizaciones. Puede ser negativo. Si no lo tiene, el rango se calcula sobre la facturación."
                      >
                        <input
                          id="ebitda"
                          type="number"
                          className={`${controlClass} pl-4`}
                          placeholder="Ej. 80000 o -20000"
                          value={ebitda}
                          onChange={(event) => setEbitda(event.target.value)}
                        />
                      </Field>
                      <Field
                        id="exerciseResult"
                        label="Resultado del ejercicio"
                        hint="Beneficio neto contable del último ejercicio. También puede ser negativo."
                      >
                        <input
                          id="exerciseResult"
                          type="number"
                          className={`${controlClass} pl-4`}
                          placeholder="Ej. 45000 o -12000"
                          value={exerciseResult}
                          onChange={(event) => setExerciseResult(event.target.value)}
                        />
                      </Field>
                      <Field id="employees" label="Empleados" hint="Plantilla aproximada. Ayuda a leer el tamaño de la operación.">
                        <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                        <input
                          id="employees"
                          type="number"
                          min={0}
                          className={controlClass}
                          placeholder="Ej. 10"
                          value={employees}
                          onChange={(event) => setEmployees(event.target.value)}
                        />
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="companyType" label="Tipo de entidad" hint="Empresa o profesional autónomo.">
                          <select
                            id="companyType"
                            className={`${controlClass} appearance-none pl-4`}
                            value={companyType}
                            onChange={(event) => setCompanyType(event.target.value)}
                          >
                            {COMPANY_TYPES.map((type) => (
                              <option key={type.value || "empty"} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field id="yearsOperating" label="Años operando" hint="Una trayectoria más larga suele estabilizar la banda.">
                          <input
                            id="yearsOperating"
                            type="number"
                            min={0}
                            className={`${controlClass} pl-4`}
                            placeholder="Ej. 5"
                            value={yearsOperating}
                            onChange={(event) => setYearsOperating(event.target.value)}
                          />
                        </Field>
                        <Field id="revenueGrowthPercent" label="Crecimiento de facturación" hint="Porcentaje frente al ejercicio anterior. 15 equivale a un 15%.">
                          <input
                            id="revenueGrowthPercent"
                            type="number"
                            className={`${controlClass} pl-4`}
                            placeholder="Ej. 15"
                            value={revenueGrowthPercent}
                            onChange={(event) => setRevenueGrowthPercent(event.target.value)}
                          />
                        </Field>
                        <Field id="arr" label="Ingresos recurrentes (ARR)" hint="Cuotas o contratos que se repiten cada año, en euros. Si no aplica, déjelo vacío.">
                          <input
                            id="arr"
                            type="number"
                            min={0}
                            className={`${controlClass} pl-4`}
                            placeholder="Ej. 120000"
                            value={arr}
                            onChange={(event) => setArr(event.target.value)}
                          />
                        </Field>
                      </div>
                      <Field id="sectorSubcategory" label="Subcategoría o nicho" hint="El segmento concreto. Ejemplo: software dental, logística frigorífica.">
                        <input
                          id="sectorSubcategory"
                          type="text"
                          maxLength={280}
                          className={`${controlClass} pl-4`}
                          placeholder="Ej. software dental"
                          value={sectorSubcategory}
                          onChange={(event) => setSectorSubcategory(event.target.value)}
                        />
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="cnae" label="CNAE" hint="Código de actividad, normalmente 4 dígitos.">
                          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                          <input
                            id="cnae"
                            type="text"
                            maxLength={10}
                            className={controlClass}
                            placeholder="Ej. 6201"
                            value={cnae}
                            onChange={(event) => setCnae(event.target.value)}
                          />
                        </Field>
                        <Field id="website" label="Página web" hint="Nos ayuda a entender la actividad. No se publica.">
                          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c4dff]/70" aria-hidden />
                          <input
                            id="website"
                            type="url"
                            className={controlClass}
                            placeholder="https://www.ejemplo.com"
                            value={website}
                            onChange={(event) => setWebsite(event.target.value)}
                          />
                        </Field>
                      </div>
                      <Field id="description" label="Descripción de la actividad" hint="A qué se dedica, qué la distingue y, si quiere, por qué se plantea una operación.">
                        <textarea
                          id="description"
                          rows={4}
                          className={`${controlClass} pl-4`}
                          placeholder="Actividad, puntos fuertes y motivo de la consulta."
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                        />
                      </Field>
                    </>
                  )}
                </div>

                {error && (
                  <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9c7ff] bg-white py-3.5 text-sm font-semibold text-[#7c4dff] hover:bg-[#f7f2ff]"
                    >
                      Siguiente
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c4dff] py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0] disabled:opacity-60"
                    >
                      {loading ? "Calculando el rango…" : "Ver valoración orientativa"}
                      {!loading && <ArrowRight className="h-4 w-4" aria-hidden />}
                    </button>
                  )}
                  {step > 0 && (
                    <button type="button" onClick={goBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
                      ← Atrás
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {!isDashboard && (
        <>
          <section className="px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c4dff]">Metodología</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">¿Cómo se calcula este rango?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                Combinamos tres criterios habituales en operaciones de compraventa de empresas para ofrecerle una
                primera referencia razonable, sin necesidad de aportar documentación.
              </p>
              <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
                {[
                  {
                    icon: TrendingUp,
                    title: "Múltiplo sobre resultado",
                    text: "Si hay EBITDA positivo, aplicamos un múltiplo de mercado sobre esa cifra. Si no lo hay, el punto de partida es la facturación o los ingresos recurrentes.",
                  },
                  {
                    icon: Briefcase,
                    title: "Comparables del sector",
                    text: "Cada actividad tiene su propia banda. Tecnología no se valora igual que hostelería, comercio o una clínica.",
                  },
                  {
                    icon: Users,
                    title: "Ajuste por trayectoria",
                    text: "Empleados, años en operación y crecimiento afinan la banda para que no sea un rango genérico.",
                  },
                ].map((item) => (
                  <article key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#7c4dff]">
                      <item.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-4 sm:px-6">
            <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c4dff]">Referencia de mercado</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Múltiplos orientativos por sector</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  El múltiplo aplicado sobre el EBITDA varía según el sector de actividad. Estos son los rangos
                  de partida que usa esta calculadora.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <ul>
                  {multiples.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5 text-sm last:border-0"
                    >
                      <span className="text-slate-700">{row.label}</span>
                      <span className="font-semibold text-[#5b34d6]">
                        {formatMultiple(row.min)} – {formatMultiple(row.max)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="px-4 py-12 sm:px-6">
            <div className="mx-auto grid max-w-5xl gap-4 rounded-3xl bg-[#f3f0fa] p-5 sm:p-8 lg:grid-cols-[1.4fr_0.8fr]">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Esto es una primera orientación, no una valoración profesional</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  El rango que obtendrá se basa únicamente en los datos que usted mismo nos facilita. Hay factores
                  cualitativos que también influyen en el valor real de una empresa y que esta calculadora no puede medir:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {[
                    "Peso de los ingresos recurrentes sobre el total de facturación",
                    "Dependencia del negocio respecto al propietario o fundador",
                    "Concentración de la cartera de clientes",
                    "Tendencia de los resultados en los últimos ejercicios",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#7c4dff]" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <article className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4dff]">Un paso más</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">¿Necesita una valoración con mayor profundidad?</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Nuestro asesoramiento pre-deal analiza su empresa con detalle, sin compromiso, antes de decidir cómo avanzar.
                </p>
                <Link href="/servicios" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#7c4dff] hover:underline">
                  Conocer el asesoramiento pre-deal
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            </div>
          </section>

          <section className="px-4 py-8 sm:px-6">
            <ul className="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
              {[
                { icon: Lock, title: "Transmisión cifrada", text: "Sus datos viajan siempre cifrados." },
                { icon: Shield, title: "Cumplimiento RGPD", text: "Tratamos su información conforme a la normativa europea de protección de datos." },
                { icon: UserRound, title: "Acceso restringido", text: "Solo el equipo de Diligenz accede a los datos de su valoración." },
              ].map((item) => (
                <li key={item.title}>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3e8ff] text-[#7c4dff]">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c4dff]">Preguntas frecuentes</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Antes de empezar</h2>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm">
                {FAQ.map((item, index) => {
                  const open = openFaq === index;
                  return (
                    <div key={item.q} className="border-b border-slate-100 last:border-0">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-800"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : index)}
                      >
                        {item.q}
                        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} aria-hidden />
                      </button>
                      {open && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={scrollToForm}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#7c4dff] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6b3df0]"
              >
                Empezar mi valoración
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
