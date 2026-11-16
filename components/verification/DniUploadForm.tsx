"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-client";

const STEPS = [
  {
    title: "Abre el enlace",
    text: "Pulsa el botón. Se abre la carpeta donde debes dejar el documento.",
  },
  {
    title: "Sube el anverso",
    text: "La cara con tu foto y tus datos, en imagen o PDF.",
  },
  {
    title: "Sube el reverso",
    text: "La otra cara del DNI o del NIE, en la misma carpeta.",
  },
] as const;

export default function DniUploadForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");
  const [step, setStep] = useState(0);
  const [motionOk, setMotionOk] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/user/dni");
      if (!res.ok) {
        setError("No se pudo cargar tu enlace de verificación.");
        return;
      }
      const data = await res.json();
      setVerified(Boolean(data.dniVerified));
      setDriveUrl(typeof data.driveFolderUrl === "string" ? data.driveFolderUrl.trim() : "");
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!motionOk || verified) return;
    const id = window.setInterval(() => setStep((current) => (current + 1) % STEPS.length), 2800);
    return () => window.clearInterval(id);
  }, [motionOk, verified]);

  if (loading) {
    return <p className="text-sm text-[var(--foreground)]">Cargando…</p>;
  }

  return (
    <div className="space-y-6 text-left">
      {verified ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Tu DNI ya está <strong>verificado</strong>.
        </div>
      ) : (
        <DniGuide step={step} motionOk={motionOk} onStep={setStep} />
      )}

      {driveUrl ? (
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
        >
          Abrir enlace y subir el DNI
        </a>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-bg)]/60 px-4 py-5 text-sm text-[var(--foreground)]">
          El enlace aparecerá aquí cuando el equipo lo haya guardado en tu ficha.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--brand-primary)]/30 px-6 py-3 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
      >
        Volver al panel
      </Link>
    </div>
  );
}

function DniGuide({
  step,
  motionOk,
  onStep,
}: {
  step: number;
  motionOk: boolean;
  onStep: (step: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_220px]">
        <ol className="divide-y divide-slate-200/80">
          {STEPS.map((item, index) => {
            const active = step === index;
            return (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => onStep(index)}
                  className={`flex w-full gap-4 px-5 py-4 text-left transition ${
                    active ? "bg-white" : "hover:bg-white/70"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-white text-slate-500 ring-1 ring-slate-200"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className={`block text-sm font-semibold ${active ? "text-slate-900" : "text-slate-600"}`}>
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-500">{item.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex items-center justify-center border-t border-slate-200 bg-white px-6 py-8 md:border-t-0 md:border-l">
          <GuideStage step={step} motionOk={motionOk} />
        </div>
      </div>
    </div>
  );
}

function GuideStage({ step, motionOk }: { step: number; motionOk: boolean }) {
  return (
    <div className="relative h-44 w-36">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${step === 0 ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <div className="relative">
            <div className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white shadow-md">
              Abrir enlace
            </div>
            {motionOk && (
              <svg
                viewBox="0 0 24 24"
                className="dni-cursor absolute -bottom-3 -right-3 h-5 w-5 text-slate-800"
                aria-hidden
              >
                <path fill="currentColor" d="M5 3l12 9-5.2 1.2L14 20l-2.2.8-2.3-6.2L5 17.2V3z" />
              </svg>
            )}
          </div>
          <p className="mt-5 text-[11px] font-medium tracking-wide text-slate-400">Carpeta del DNI</p>
        </div>
      </div>

      <IdCard face="front" visible={step === 1} motionOk={motionOk} />
      <IdCard face="back" visible={step === 2} motionOk={motionOk} />
    </div>
  );
}

function IdCard({
  face,
  visible,
  motionOk,
}: {
  face: "front" | "back";
  visible: boolean;
  motionOk: boolean;
}) {
  const front = face === "front";
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {front ? "Anverso" : "Reverso"}
          </span>
          <span className="h-1.5 w-6 rounded-full bg-[var(--brand-primary)]/70" />
        </div>
        <div className="space-y-2 px-3 py-3">
          {front ? (
            <div className="flex gap-2">
              <div className="h-10 w-8 rounded-md bg-slate-100" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-1.5 w-full rounded-full bg-slate-200" />
                <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
                <div className="h-1.5 w-3/5 rounded-full bg-slate-100" />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="h-8 rounded-md bg-slate-100" />
              <div className="h-1.5 w-full rounded-full bg-slate-200" />
              <div className="h-1.5 w-5/6 rounded-full bg-slate-100" />
              <div className="h-1.5 w-2/3 rounded-full bg-slate-100" />
            </div>
          )}
        </div>
        {motionOk && visible && (
          <div className="dni-scan pointer-events-none absolute inset-x-3 top-10 h-px bg-[var(--brand-primary)] shadow-[0_0_12px_rgba(145,70,255,0.65)]" />
        )}
      </div>
    </div>
  );
}
