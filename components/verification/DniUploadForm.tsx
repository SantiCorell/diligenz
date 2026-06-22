"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-client";
import type { DniVerificationStatus } from "@/lib/user-documents/dni-status";
import { dniStatusLabel } from "@/lib/user-documents/dni-status";

type SideState = {
  uploaded: boolean;
  name: string;
  syncedToDrive: boolean;
} | null;

type DniState = {
  dniVerified: boolean;
  verificationStatus: DniVerificationStatus;
  pendingReview: boolean;
  front: SideState;
  back: SideState;
  driveFolderUrl: string | null;
};

export default function DniUploadForm() {
  const [state, setState] = useState<DniState | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"front" | "back" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/user/dni");
      if (!res.ok) {
        setError("No se pudo cargar el estado del DNI.");
        return;
      }
      setState(await res.json());
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (side: "front" | "back", file: File) => {
    setError(null);
    setMsg(null);
    setUploading(side);
    try {
      const fd = new FormData();
      fd.set("side", side);
      fd.set("file", file);
      const res = await authFetch("/api/user/dni", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo subir el archivo.");
        return;
      }
      if (data.pendingReview) {
        setMsg(
          data.syncedToDrive
            ? "Documentos completos. Estado: pendiente de verificar. El equipo revisará tu DNI en Google Drive."
            : "Documentos completos. Pendiente de verificar por el equipo Diligenz."
        );
      } else {
        setMsg(
          data.syncedToDrive
            ? "Foto guardada y copiada a Google Drive. Sube también el otro lado del documento."
            : "Foto guardada. Sube también el otro lado del documento."
        );
      }
      await load();
    } catch {
      setError("Error de conexión al subir.");
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--foreground)] opacity-80">Cargando…</p>;
  }

  const status = state?.verificationStatus ?? "none";

  return (
    <div className="space-y-6 text-left">
      {status === "verified" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Tu DNI ha sido <strong>verificado</strong> por el equipo Diligenz.
        </div>
      ) : status === "pending" ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Pendiente de verificar</p>
          <p className="mt-1 opacity-90">
            Hemos recibido el anverso y el reverso. Las fotos están en tu carpeta de Google Drive
            (subcarpeta <strong>Identidad</strong>). El equipo las revisará y marcará la verificación
            en tu perfil.
          </p>
        </div>
      ) : status === "incomplete" ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          Has subido una parte del DNI. Falta el{" "}
          <strong>{state?.front ? "reverso" : "anverso"}</strong> para pasar a revisión.
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)]/60 px-4 py-3 text-sm text-[var(--foreground)]">
          Sube el <strong>anverso</strong> y el <strong>reverso</strong> de tu DNI o NIE. Al completar
          ambos, el estado pasará a <strong>pendiente de verificar</strong>.
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-[var(--foreground)] opacity-70">Estado:</span>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            status === "verified"
              ? "bg-emerald-100 text-emerald-900"
              : status === "pending"
                ? "bg-amber-100 text-amber-900"
                : status === "incomplete"
                  ? "bg-sky-100 text-sky-900"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
          {dniStatusLabel(status)}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <UploadCard
          label="Anverso (frontal)"
          side="front"
          info={state?.front ?? null}
          uploading={uploading === "front"}
          verified={status === "verified"}
          onFile={(f) => upload("front", f)}
        />
        <UploadCard
          label="Reverso (trasera)"
          side="back"
          info={state?.back ?? null}
          uploading={uploading === "back"}
          verified={status === "verified"}
          onFile={(f) => upload("back", f)}
        />
      </div>

      {state?.driveFolderUrl && (
        <p className="text-xs text-[var(--foreground)] opacity-75">
          Tus fotos del DNI se guardan en Google Drive → carpeta{" "}
          <strong>Identidad</strong>.{" "}
          <a
            href={state.driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-primary)] font-medium underline"
          >
            Abrir mi carpeta
          </a>
        </p>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {msg && (
        <div className="rounded-xl bg-[var(--brand-bg-mint)]/40 border border-[var(--brand-primary)]/15 px-4 py-3 text-sm text-[var(--brand-dark)]">
          {msg}
        </div>
      )}

      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold border-2 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
      >
        Volver al panel
      </Link>
    </div>
  );
}

function UploadCard({
  label,
  side,
  info,
  uploading,
  verified,
  onFile,
}: {
  label: string;
  side: "front" | "back";
  info: SideState;
  uploading: boolean;
  verified: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--brand-primary)]/15 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[var(--brand-primary)] mb-2">{label}</p>
      {info?.uploaded ? (
        <div className="mb-3 text-xs text-[var(--foreground)] opacity-85">
          <p className="font-medium truncate" title={info.name}>
            {info.name}
          </p>
          {info.syncedToDrive ? (
            <p className="text-emerald-700 mt-1">✓ Copiado a Google Drive (Identidad)</p>
          ) : (
            <p className="text-amber-700 mt-1">Guardado · pendiente de copia a Drive</p>
          )}
          <a
            href={`/api/user/dni/file?side=${side}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[var(--brand-primary)] underline"
          >
            Ver archivo
          </a>
        </div>
      ) : (
        <p className="text-xs text-[var(--foreground)] opacity-70 mb-3">Pendiente de subir</p>
      )}
      {!verified && (
        <label className="block">
          <span className="sr-only">Subir {label}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={uploading}
            className="block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--brand-primary)] file:px-3 file:py-2 file:text-white file:font-semibold disabled:opacity-50"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {uploading && <p className="mt-2 text-xs opacity-70">Subiendo…</p>}
    </div>
  );
}
