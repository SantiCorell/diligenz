"use client";

import { useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-client";
import {
  MANDATO_COMPRA_ACCEPTANCE_TEXT,
  MANDATO_COMPRA_CLAUSES_EXCERPT,
  MANDATO_COMPRA_FEE_SUMMARY,
  MANDATO_COMPRA_LEGAL_LINKS,
  MANDATO_COMPRA_META,
} from "@/lib/mandato/clauses-compra";
import SignaturePad from "./SignaturePad";

type Prefill = {
  name?: string | null;
  email: string;
  phone?: string | null;
};

type Props = {
  prefill: Prefill;
  alreadySigned?: boolean;
  signedAt?: string | null;
  signedEmail?: string;
  panelHref?: string;
};

const STEPS = ["Tus datos", "Firma digital", "Confirmación"] as const;

export default function MandatoCompraSignWizard({
  prefill,
  alreadySigned,
  signedAt,
  signedEmail,
  panelHref = "/dashboard/buyer",
}: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadySigned ?? false);

  const [buyerLegalName, setBuyerLegalName] = useState(prefill.name ?? "");
  const [buyerNifCif, setBuyerNifCif] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [contactEmail, setContactEmail] = useState(prefill.email);
  const [contactPhone, setContactPhone] = useState(prefill.phone ?? "");
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeDni, setRepresentativeDni] = useState("");
  const [representativeRole, setRepresentativeRole] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [clausesOpen, setClausesOpen] = useState(false);

  const validateStep1 = () => {
    if (!buyerLegalName.trim() || !buyerNifCif.trim() || !buyerAddress.trim()) {
      setError("Completa nombre/razón social, NIF/CIF y domicilio del comprador.");
      return false;
    }
    if (!contactEmail.trim()) {
      setError("Indica un email de contacto.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!signature) {
      setError("Dibuja tu firma en el recuadro.");
      return false;
    }
    if (!accepted) {
      setError("Debes aceptar las cláusulas del mandato.");
      return false;
    }
    return true;
  };

  const next = () => {
    setError(null);
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sign = async () => {
    setError(null);
    if (!validateStep1() || !validateStep2()) {
      setStep(!validateStep1() ? 0 : 1);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch("/api/mandato/compra/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerLegalName: buyerLegalName.trim(),
          buyerNifCif: buyerNifCif.trim(),
          buyerAddress: buyerAddress.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          representativeName: representativeName.trim(),
          representativeDni: representativeDni.trim(),
          representativeRole: representativeRole.trim() || null,
          signaturePngBase64: signature,
          termsAccepted: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo firmar el mandato.");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `mandato-compra-diligenz-${date}.zip`);
      setDone(true);
      setLoading(false);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-8 text-center shadow-md">
        <h1 className="text-xl font-bold text-[var(--brand-primary)] sm:text-2xl">
          Mandato firmado correctamente
        </h1>
        <p className="mt-3 text-sm text-[var(--foreground)] opacity-90">
          Tu mandato de compra ha quedado registrado
          {signedAt ? ` el ${new Date(signedAt).toLocaleDateString("es-ES")}` : ""}.
          Has recibido un ZIP con las <strong>Condiciones Particulares</strong> y las{" "}
          <strong>Condiciones Generales</strong> firmadas. También las enviamos a{" "}
          <strong>{signedEmail ?? contactEmail ?? prefill.email}</strong> si el correo está
          configurado.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              authFetch("/api/mandato/compra/download")
                .then((r) => r.blob())
                .then((b) => downloadBlob(b, "mandato-compra-diligenz.zip"))
            }
            className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-5 py-3 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
          >
            Descargar ZIP de nuevo
          </button>
          <Link
            href={panelHref}
            className="rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
          >
            Ir a mi panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-[var(--brand-bg-mint)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
          Completa tu mandato
        </span>
        <h1 className="mt-2 text-2xl font-bold text-[var(--brand-primary)] sm:text-3xl">
          {MANDATO_COMPRA_META.title}
        </h1>
        <p className="mt-1 text-xs text-[var(--foreground)] opacity-80 sm:text-sm">
          {MANDATO_COMPRA_META.subtitle}
        </p>
        <p className="mt-2 text-xs text-[var(--foreground)] opacity-75 sm:text-sm">
          Al firmar recibirás automáticamente los dos documentos firmados: Condiciones Particulares y
          Condiciones Generales.
        </p>
      </div>

      <ol className="mb-8 flex gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-xs font-medium sm:text-sm ${
              i === step
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md"
                : i < step
                  ? "border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 text-[var(--brand-primary)]"
                  : "border-[var(--brand-primary)]/15 bg-white text-[var(--foreground)] opacity-70"
            }`}
          >
            <span className="mr-1 opacity-80">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-6 shadow-md sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[var(--brand-primary)]">
                Datos del comprador
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nombre / Razón social *"
                  value={buyerLegalName}
                  onChange={setBuyerLegalName}
                  className="sm:col-span-2"
                />
                <Field label="NIF / CIF *" value={buyerNifCif} onChange={setBuyerNifCif} />
                <Field
                  label="Email de contacto *"
                  value={contactEmail}
                  onChange={setContactEmail}
                  type="email"
                />
                <Field
                  label="Domicilio *"
                  value={buyerAddress}
                  onChange={setBuyerAddress}
                  className="sm:col-span-2"
                />
                <Field label="Teléfono" value={contactPhone} onChange={setContactPhone} type="tel" />
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[var(--brand-primary)]">
                Representante legal
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nombre y apellidos (opcional)"
                  value={representativeName}
                  onChange={setRepresentativeName}
                />
                <Field label="DNI / NIF (opcional)" value={representativeDni} onChange={setRepresentativeDni} />
                <Field
                  label="Cargo / apoderamiento"
                  value={representativeRole}
                  onChange={setRepresentativeRole}
                  className="sm:col-span-2"
                />
              </div>
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)]/50">
              <button
                type="button"
                onClick={() => setClausesOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-[var(--brand-primary)]"
              >
                Cláusulas del contrato — Léelas antes de firmar
                <span className="text-lg">{clausesOpen ? "−" : "+"}</span>
              </button>
              {clausesOpen && (
                <div className="max-h-64 overflow-y-auto border-t border-[var(--brand-primary)]/10 px-4 py-3 text-xs leading-relaxed text-[var(--foreground)] opacity-90 whitespace-pre-wrap">
                  {MANDATO_COMPRA_CLAUSES_EXCERPT}
                  <div className="mt-4 space-y-1">
                    <p className="font-semibold">Documentos completos:</p>
                    <a
                      href={MANDATO_COMPRA_LEGAL_LINKS.generales}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[var(--brand-primary)] underline"
                    >
                      Condiciones Generales (PDF)
                    </a>
                    <a
                      href={MANDATO_COMPRA_LEGAL_LINKS.particulares}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[var(--brand-primary)] underline"
                    >
                      Condiciones Particulares (PDF)
                    </a>
                  </div>
                </div>
              )}
            </div>

            <ul className="list-disc space-y-1.5 pl-4 text-xs text-[var(--foreground)] opacity-85">
              {MANDATO_COMPRA_FEE_SUMMARY.map((f) => (
                <li key={f}>{f}</li>
              ))}
              <li>Datos tratados conforme al RGPD (UE) 2016/679 y LOPDGDD 3/2018.</li>
            </ul>

            <SignaturePad onChange={setSignature} />

            <label className="flex cursor-pointer items-start gap-3 text-xs text-[var(--foreground)] opacity-90 sm:text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 shrink-0"
              />
              <span>{MANDATO_COMPRA_ACCEPTANCE_TEXT}</span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-sm text-[var(--foreground)] opacity-90">
            <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Revisa y confirma</h2>
            <dl className="grid gap-3 text-xs sm:grid-cols-2 sm:text-sm">
              <Item k="Comprador" v={buyerLegalName} />
              <Item k="NIF/CIF" v={buyerNifCif} />
              <Item k="Domicilio" v={buyerAddress} className="sm:col-span-2" />
              <Item k="Representante" v={representativeName} />
              <Item k="DNI/NIF rep." v={representativeDni} />
              <Item k="Email" v={contactEmail} />
            </dl>
            <p className="text-xs opacity-75">
              Al pulsar «Firmar mandato» se generarán los dos PDF firmados, se empaquetarán en un ZIP
              para descarga automática y se enviarán a tu correo.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="rounded-xl border border-[var(--brand-primary)]/30 px-5 py-3 text-sm font-medium text-[var(--brand-primary)]"
            >
              Atrás
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="ml-auto rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={sign}
              disabled={loading}
              className="ml-auto rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Firmando…" : "Firmar mandato y descargar ZIP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-[var(--brand-primary)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 bg-white px-4 py-2.5 text-sm"
      />
    </div>
  );
}

function Item({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="font-medium text-[var(--brand-primary)]">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
