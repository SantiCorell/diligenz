"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Check, UserRound } from "lucide-react";
import { authFetch, setStoredToken } from "@/lib/auth-client";

const STEPS = [
  {
    title: "Formalizar el pago",
    text: "Abonamos el precio cerrado del servicio para dar comienzo al trámite de constitución.",
  },
  {
    title: "Nos facilita sus datos y hasta 5 nombres posibles",
    text: "Datos de los socios, capital social y domicilio social, junto con hasta cinco denominaciones sociales por orden de preferencia.",
  },
  {
    title: "Solicitamos la certificación negativa de denominación",
    text: "Al Registro Mercantil Central, para confirmar que el nombre elegido está disponible.",
  },
  {
    title: "Tramitación de la constitución",
    text: "Iniciamos el expediente ante el Punto de Atención al Emprendedor (CIRCE) mediante el Documento Único Electrónico (DUE), dando comienzo formal al trámite.",
  },
  {
    title: "Apertura de cuenta bancaria",
    text: "Le ayudamos a tramitarla: usted elige la entidad y oficina de su preferencia y nosotros coordinamos la cita para el depósito del capital social.",
  },
  {
    title: "Otorgamiento de la escritura ante notario",
    text: "Por videoconferencia, sin necesidad de desplazamiento. Reciben la copia de la escritura con Código Seguro de Verificación (CSV).",
  },
  {
    title: "Inscripción en el Registro Mercantil",
    text: "Completamos la inscripción y obtención del CIF definitivo de la sociedad.",
  },
  {
    title: "Apertura de cartera virtual en la Sede Electrónica de los Registradores",
    text: "Para recibir y gestionar de forma electrónica las notificaciones y documentos del Registro Mercantil.",
  },
  {
    title: "Tramitamos la firma digital",
    text: "Si el administrador no dispone de certificado digital de la FNMT, gestionamos su obtención.",
  },
  {
    title: "Declaración de titularidad real",
    text: "Tramitada a través de la herramienta Iure, conforme a la normativa de prevención de blanqueo de capitales.",
  },
];

const DOCS_LEFT = [
  "Nombre, apellidos y estado civil (régimen económico matrimonial, en su caso)",
  "Número de la Seguridad Social",
  "Número de socios y porcentaje de participación de cada uno",
  "Hasta 5 denominaciones sociales posibles",
];

const DOCS_RIGHT = [
  "Domicilio y datos de contacto",
  "Alta como autónomo, si procede",
  "Importe del capital social",
  "DNI o NIE del representante",
];

const THIRD_PARTY = [
  { label: "Notaría", value: "60 € + IVA" },
  { label: "Copia de la escritura", value: "40,57 € + IVA" },
  { label: "Registro Mercantil", value: "40 € + IVA" },
  { label: "Certificación negativa", value: "27 €" },
];

const SL_SUBJECT = "Constitución exprés de sociedad limitada";
const SL_MESSAGE = [
  "Servicio: Constitución exprés de sociedad limitada",
  "Honorarios de Diligenz: 300 € + IVA",
  "Gastos de gestión y terceros, orientativos y aparte: notaría 60 € + IVA; copia de la escritura 40,57 € + IVA; Registro Mercantil 40 € + IVA; certificación negativa 27 €.",
  "Tramitación de firma digital y titularidad real (Iure): por confirmar.",
].join("\n");

const inputClass =
  "w-full rounded-xl border border-[#ddd6ea] bg-white px-3.5 py-3 text-sm text-[var(--brand-dark)] outline-none placeholder:text-[var(--foreground)]/40 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15";

export default function ConstitucionSl() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  const submitRequest = async (payload: {
    name: string;
    email: string;
    phone: string;
  }) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "servicios",
        type: "PARTICULAR",
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        subject: SL_SUBJECT,
        message: SL_MESSAGE,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "No se ha podido registrar la solicitud.");
    }
  };

  const start = async () => {
    setError(null);
    setChecking(true);
    try {
      const res = await authFetch("/api/user/me");
      if (res.ok) {
        const me = await res.json();
        const fullName = (me.name || "").trim();
        const phoneValue = (me.phone || "").trim();
        setAlreadyLoggedIn(true);
        setName(fullName);
        setEmail(me.email || "");
        setPhone(phoneValue);
        if (fullName.length < 2 || !me.email || phoneValue.replace(/\D/g, "").length < 9) {
          setOpen(true);
          return;
        }
        await submitRequest({
          name: fullName,
          email: me.email,
          phone: phoneValue,
        });
        router.push("/dashboard/servicios");
        return;
      }
      setAlreadyLoggedIn(false);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido continuar.");
      setOpen(true);
    } finally {
      setChecking(false);
    }
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullName = name.trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      setError("Indique nombre y apellidos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Indique un correo electrónico válido.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Indique un teléfono válido.");
      return;
    }
    if (!alreadyLoggedIn && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!alreadyLoggedIn && !accepted) {
      setError("Acepte los términos y la política de privacidad.");
      return;
    }

    setSubmitting(true);
    try {
      if (alreadyLoggedIn) {
        await authFetch("/api/user/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: fullName, phone: phone.trim() }),
        });
        await submitRequest({
          name: fullName,
          email: email.trim(),
          phone: phone.trim(),
        });
        router.push("/dashboard/servicios");
        router.refresh();
        return;
      }

      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: parts[0],
          lastName: parts.slice(1).join(" "),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: "BUYER",
        }),
      });
      const registerData = await registerRes.json().catch(() => ({}));
      if (!registerRes.ok) {
        setError(registerData.error || "No se ha podido crear la cuenta.");
        setSubmitting(false);
        return;
      }
      if (registerData.token) setStoredToken(registerData.token);
      await submitRequest({
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
      });
      router.push("/dashboard/servicios");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión.");
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/servicios"
          className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--brand-primary)]"
        >
          ← Volver a servicios
        </Link>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              Constitución de sociedades · Procedimiento CIRCE / PAE
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-4xl">
              Constitución exprés de su sociedad limitada
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--foreground)]/70 sm:text-base">
              Tramitamos la constitución de su SL de forma íntegramente telemática
              a través del Punto de Atención al Emprendedor (CIRCE), con otorgamiento
              notarial por videoconferencia e inscripción registral.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={start}
                disabled={checking}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {checking ? "Comprobando la sesión…" : "Empezar mi constitución"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <span className="text-sm text-[var(--foreground)]/55">
                Honorarios cerrados · Sin sorpresas
              </span>
            </div>
            {error && !open && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {["100% telemático", "Honorarios cerrados", "Sin desplazamientos"].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden h-44 items-center justify-center rounded-[1.6rem] bg-[#ebe4f8] lg:flex">
            <Building2 className="h-16 w-16 text-[var(--brand-primary)]/70" strokeWidth={1.5} aria-hidden />
          </div>
        </div>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <section className="rounded-[1.6rem] border border-[var(--brand-primary)]/10 bg-white px-5 py-6 sm:px-7 sm:py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              Cómo funciona
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--brand-dark)]">
              El proceso, paso a paso
            </h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-sm font-bold text-[var(--brand-primary)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[var(--brand-dark)]">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]/70">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-[1.6rem] border border-[var(--brand-primary)]/10 bg-white px-5 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                Gastos de gestión y terceros
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {THIRD_PARTY.map((row) => (
                  <li key={row.label} className="flex items-start justify-between gap-4">
                    <span className="text-[var(--foreground)]/75">{row.label}</span>
                    <span className="shrink-0 font-semibold text-[var(--brand-dark)]">{row.value}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-4 border-t border-[var(--brand-primary)]/10 pt-3">
                  <span className="text-[var(--foreground)]/75">Tramitación firma digital</span>
                  <span className="rounded-full bg-[#f3f0f7] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]/60">
                    Por confirmar
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4">
                  <span className="text-[var(--foreground)]/75">Titularidad real (Iure)</span>
                  <span className="rounded-full bg-[#f3f0f7] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]/60">
                    Por confirmar
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-[var(--foreground)]/55">
                Importes orientativos sujetos a confirmación. Corresponden a
                terceros (notaría, registro y otros organismos).
              </p>
            </section>

            <section className="rounded-[1.6rem] bg-[#f3eefe] px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                Honorarios Diligenz
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]/70">
                Tramitación completa, de principio a fin.
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[var(--brand-primary)]">300 € + IVA</p>
            </section>

            <button
              type="button"
              onClick={start}
              disabled={checking}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              Empezar mi constitución
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>

            <section className="rounded-[1.6rem] border border-[var(--brand-primary)]/10 bg-white px-5 py-5">
              <p className="font-bold text-[var(--brand-dark)]">¿Ya tiene una sociedad constituida?</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/70">
                Conozca el pacto de socios, la asesoría por áreas y las
                oportunidades de inversión desde su{" "}
                <Link href="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
                  área de cliente
                </Link>
                .
              </p>
            </section>
          </aside>
        </div>

        <section className="mt-5 rounded-[1.6rem] border border-[var(--brand-primary)]/10 bg-white px-5 py-6 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
            Qué necesitamos de usted
          </p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--brand-dark)]">
            Documentación e información a aportar
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/60">
            Listado orientativo — se lo detallaremos de forma personalizada al iniciar el trámite.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[DOCS_LEFT, DOCS_RIGHT].map((column) => (
              <ul key={column[0]} className="space-y-2.5 text-sm text-[var(--foreground)]/75">
                {column.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" strokeWidth={2.5} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#2a2438]/55 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sl-account-title"
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[1.6rem] bg-white px-5 py-6 shadow-2xl sm:px-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                <UserRound className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                  Antes de empezar
                </p>
                <h2 id="sl-account-title" className="text-xl font-extrabold text-[var(--brand-dark)]">
                  {alreadyLoggedIn ? "Confirme sus datos" : "Cree su acceso de cliente"}
                </h2>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#f6f3fb] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--brand-dark)]">
                Está solicitando: Constitución de sociedad limitada
              </p>
              <p className="mt-1 text-xs text-[var(--foreground)]/65">
                Honorarios cerrados: 300 € + IVA · Sin sorpresas
              </p>
            </div>

            <form onSubmit={createAccount} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold text-[var(--brand-dark)]">
                Nombre completo
                <input
                  className={`${inputClass} mt-1.5`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre y apellidos"
                  autoComplete="name"
                  required
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[var(--brand-dark)]">
                  Email
                  <input
                    type="email"
                    className={`${inputClass} mt-1.5 disabled:bg-[#f6f3fb]`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usted@email.com"
                    autoComplete="email"
                    required
                    readOnly={alreadyLoggedIn}
                  />
                </label>
                <label className="block text-sm font-semibold text-[var(--brand-dark)]">
                  Teléfono
                  <input
                    className={`${inputClass} mt-1.5`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="600 000 000"
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>
              {!alreadyLoggedIn && (
                <label className="block text-sm font-semibold text-[var(--brand-dark)]">
                  Contraseña
                  <input
                    type="password"
                    className={`${inputClass} mt-1.5`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
              )}
              {!alreadyLoggedIn && (
              <label className="flex items-start gap-2 text-sm text-[var(--foreground)]/75">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>
                  Acepto los{" "}
                  <Link href="/aviso-legal" className="font-semibold text-[var(--brand-primary)] hover:underline">
                    Términos de servicio
                  </Link>{" "}
                  y la{" "}
                  <Link href="/politica-privacidad" className="font-semibold text-[var(--brand-primary)] hover:underline">
                    Política de privacidad
                  </Link>{" "}
                  de Diligenz.
                </span>
              </label>
              )}
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {submitting
                  ? "Enviando…"
                  : alreadyLoggedIn
                    ? "Continuar con la solicitud"
                    : "Crear cuenta y continuar"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </form>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--foreground)]/65">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" aria-hidden />
              {alreadyLoggedIn
                ? "La solicitud quedará en Mis servicios, con el perfil que ya tiene."
                : "Siguiente paso tras crear la cuenta: formalizar el pago. La cuenta se abre como comprador para que la solicitud quede en Mis servicios y pueda, si quiere, explorar empresas."}
            </p>
            <p className="mt-3 text-center text-sm text-[var(--foreground)]/70">
              ¿Ya tiene cuenta?{" "}
              <Link href="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
                Iniciar sesión
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-center text-sm text-[var(--foreground)]/50 hover:text-[var(--brand-dark)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
