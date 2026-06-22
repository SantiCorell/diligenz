"use client";

import { useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-client";
import {
  LEGAL_PDF_LINKS,
  MANDATO_ACCEPTANCE_TEXT,
  MANDATO_FEE_SUMMARY,
  MANDATO_GENERAL_CLAUSES_EXCERPT,
  MANDATO_META,
} from "@/lib/mandato/clauses";
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
};

const STEPS = ["Tus datos", "Firma digital", "Confirmación"] as const;

export default function MandatoSignWizard({ prefill, alreadySigned, signedAt, signedEmail }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadySigned ?? false);

  const [representativeName, setRepresentativeName] = useState(prefill.name ?? "");
  const [representativeDni, setRepresentativeDni] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [companyCif, setCompanyCif] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contactEmail, setContactEmail] = useState(prefill.email);
  const [contactPhone, setContactPhone] = useState(prefill.phone ?? "");
  const [companyTradeName, setCompanyTradeName] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [companyCnae, setCompanyCnae] = useState("");
  const [companyFoundedYear, setCompanyFoundedYear] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [lastRevenueEur, setLastRevenueEur] = useState("");
  const [lastEbitdaEur, setLastEbitdaEur] = useState("");
  const [expectedSalePriceEur, setExpectedSalePriceEur] = useState("");
  const [saleReason, setSaleReason] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [clausesOpen, setClausesOpen] = useState(false);

  const validateStep1 = () => {
    if (!representativeName.trim() || !representativeDni.trim()) {
      setError("Indica nombre y DNI/NIF del representante legal.");
      return false;
    }
    if (!companyLegalName.trim() || !companyCif.trim() || !companyAddress.trim()) {
      setError("Completa razón social, CIF y domicilio social.");
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
      const res = await authFetch("/api/mandato/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          representativeName: representativeName.trim(),
          representativeDni: representativeDni.trim(),
          companyLegalName: companyLegalName.trim(),
          companyCif: companyCif.trim(),
          companyAddress: companyAddress.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          companyTradeName: companyTradeName.trim() || null,
          companySector: companySector.trim() || null,
          companyCnae: companyCnae.trim() || null,
          companyFoundedYear: companyFoundedYear ? Number(companyFoundedYear) : null,
          employeeCount: employeeCount ? Number(employeeCount) : null,
          lastRevenueEur: lastRevenueEur ? Number(lastRevenueEur) : null,
          lastEbitdaEur: lastEbitdaEur ? Number(lastEbitdaEur) : null,
          expectedSalePriceEur: expectedSalePriceEur ? Number(expectedSalePriceEur) : null,
          saleReason: saleReason.trim() || null,
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
      downloadBlob(blob, `mandato-venta-diligenz-${date}.pdf`);
      setDone(true);
      setLoading(false);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-8 shadow-md text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Mandato firmado correctamente
        </h1>
        <p className="mt-3 text-sm text-[var(--foreground)] opacity-90">
          Tu mandato de venta ha quedado registrado
          {signedAt ? ` el ${new Date(signedAt).toLocaleDateString("es-ES")}` : ""}.
          Hemos enviado una copia a <strong>{signedEmail ?? contactEmail ?? prefill.email}</strong> si el correo está configurado en el servidor.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => authFetch("/api/mandato/download").then((r) => r.blob()).then((b) => downloadBlob(b, "mandato-venta-diligenz.pdf"))}
            className="rounded-xl px-5 py-3 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
          >
            Descargar de nuevo
          </button>
          <Link
            href="/dashboard/seller"
            className="rounded-xl px-5 py-3 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95"
          >
            Ir a mi panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-[var(--brand-bg-mint)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
          Completa tu mandato
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--brand-primary)]">
          {MANDATO_META.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[var(--foreground)] opacity-80">
          {MANDATO_META.subtitle}
        </p>
      </div>

      <ol className="mb-8 flex gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-xs sm:text-sm font-medium transition ${
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

      <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-6 sm:p-8 shadow-md">
        {step === 0 && (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-[var(--brand-primary)] mb-3">
                Representante legal
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre y apellidos *" value={representativeName} onChange={setRepresentativeName} />
                <Field label="DNI / NIF *" value={representativeDni} onChange={setRepresentativeDni} />
              </div>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-[var(--brand-primary)] mb-3">
                Datos de la sociedad (vendedor)
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Razón social *" value={companyLegalName} onChange={setCompanyLegalName} className="sm:col-span-2" />
                <Field label="CIF *" value={companyCif} onChange={setCompanyCif} />
                <Field label="Email de contacto *" value={contactEmail} onChange={setContactEmail} type="email" />
                <Field label="Domicilio social *" value={companyAddress} onChange={setCompanyAddress} className="sm:col-span-2" />
                <Field label="Teléfono" value={contactPhone} onChange={setContactPhone} type="tel" />
              </div>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-[var(--brand-primary)] mb-1">
                Datos de la empresa en venta (opcional)
              </h2>
              <p className="text-xs text-[var(--foreground)] opacity-70 mb-3">
                Puedes completarlos ahora o más adelante con tu asesor Diligenz.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Denominación / marca" value={companyTradeName} onChange={setCompanyTradeName} />
                <Field label="Sector" value={companySector} onChange={setCompanySector} />
                <Field label="CNAE" value={companyCnae} onChange={setCompanyCnae} />
                <Field label="Año constitución" value={companyFoundedYear} onChange={setCompanyFoundedYear} type="number" />
                <Field label="Nº empleados" value={employeeCount} onChange={setEmployeeCount} type="number" />
                <Field label="Facturación últ. ejercicio (€)" value={lastRevenueEur} onChange={setLastRevenueEur} type="number" />
                <Field label="EBITDA últ. ejercicio (€)" value={lastEbitdaEur} onChange={setLastEbitdaEur} type="number" />
                <Field label="Precio venta esperado (€)" value={expectedSalePriceEur} onChange={setExpectedSalePriceEur} type="number" />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--brand-primary)] mb-1">Motivo de la venta</label>
                  <textarea
                    value={saleReason}
                    onChange={(e) => setSaleReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-3 text-sm"
                  />
                </div>
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
                <div className="border-t border-[var(--brand-primary)]/10 px-4 py-3 max-h-64 overflow-y-auto text-xs text-[var(--foreground)] opacity-90 whitespace-pre-wrap leading-relaxed">
                  {MANDATO_GENERAL_CLAUSES_EXCERPT}
                  <div className="mt-4 space-y-1">
                    <p className="font-semibold">Documentos completos:</p>
                    <a href={LEGAL_PDF_LINKS.generales} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] underline block">
                      Condiciones Generales (PDF)
                    </a>
                    <a href={LEGAL_PDF_LINKS.particulares} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-primary)] underline block">
                      Condiciones Particulares (PDF)
                    </a>
                  </div>
                </div>
              )}
            </div>

            <ul className="text-xs text-[var(--foreground)] opacity-85 space-y-1.5 list-disc pl-4">
              {MANDATO_FEE_SUMMARY.map((f) => (
                <li key={f}>{f}</li>
              ))}
              <li>Datos tratados conforme al RGPD (UE) 2016/679 y LOPDGDD 3/2018.</li>
            </ul>

            <SignaturePad onChange={setSignature} />

            <label className="flex gap-3 items-start text-xs sm:text-sm text-[var(--foreground)] opacity-90 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 shrink-0"
              />
              <span>{MANDATO_ACCEPTANCE_TEXT}</span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-sm text-[var(--foreground)] opacity-90">
            <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Revisa y confirma</h2>
            <dl className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <Item k="Representante" v={representativeName} />
              <Item k="DNI/NIF" v={representativeDni} />
              <Item k="Razón social" v={companyLegalName} />
              <Item k="CIF" v={companyCif} />
              <Item k="Domicilio" v={companyAddress} className="sm:col-span-2" />
              <Item k="Email" v={contactEmail} />
            </dl>
            <p className="text-xs opacity-75">
              Al pulsar «Firmar mandato» se generará el PDF firmado, se descargará automáticamente y se enviará a tu correo.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 justify-between">
          {step > 0 ? (
            <button type="button" onClick={back} className="rounded-xl px-5 py-3 text-sm font-medium border border-[var(--brand-primary)]/30 text-[var(--brand-primary)]">
              Atrás
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-xl px-6 py-3 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 ml-auto"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={sign}
              disabled={loading}
              className="rounded-xl px-6 py-3 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 ml-auto disabled:opacity-50"
            >
              {loading ? "Firmando…" : "Firmar mandato y descargar"}
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
      <label className="block text-xs font-medium text-[var(--brand-primary)] mb-1">{label}</label>
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
      <dt className="text-[var(--brand-primary)] font-medium">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
