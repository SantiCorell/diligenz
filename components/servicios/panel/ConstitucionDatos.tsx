"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import type { IntakeSnapshot } from "@/lib/service-intake";

type DniSide = { name: string; syncedToDrive: boolean } | null;

type Props = {
  initial: IntakeSnapshot;
  variant?: "page" | "admin";
  userId?: string | null;
  children?: React.ReactNode;
};

export default function ConstitucionDatos({ initial, variant = "page", userId = null, children }: Props) {
  const router = useRouter();
  const canEdit = variant === "admin";
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dniFront, setDniFront] = useState<DniSide>(null);
  const [dniBack, setDniBack] = useState<DniSide>(null);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null);

  const loadDni = useCallback(async () => {
    const url = canEdit && userId ? `/api/admin/users/${userId}/dni` : "/api/user/dni";
    const res = await authFetch(url);
    if (!res.ok) return;
    const data = (await res.json()) as {
      front?: { name?: string; syncedToDrive?: boolean } | null;
      back?: { name?: string; syncedToDrive?: boolean } | null;
      driveFolderUrl?: string | null;
    };
    setDniFront(data.front?.name ? { name: data.front.name, syncedToDrive: Boolean(data.front.syncedToDrive) } : null);
    setDniBack(data.back?.name ? { name: data.back.name, syncedToDrive: Boolean(data.back.syncedToDrive) } : null);
    setDriveFolderUrl(data.driveFolderUrl ?? null);
  }, [canEdit, userId]);

  useEffect(() => {
    void loadDni();
  }, [loadDni]);

  const set = (key: "companyName" | "shareholders" | "shareCapital" | "registeredOffice" | "managementRegime" | "proposedNames" | "constitutionDetails" | "digitalSignature" | "bankOffice", value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await authFetch("/api/servicios/intake", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; intake?: IntakeSnapshot };
    setSaving(false);
    if (!res.ok || !data.intake) {
      setError(data.error || "No se han podido guardar los datos.");
      return;
    }
    setValues(data.intake);
    setMessage("Datos guardados en el expediente.");
    router.refresh();
  };

  const uploadDni = async (side: "front" | "back", file: File) => {
    const form = new FormData();
    form.set("side", side);
    form.set("file", file);
    if (values.clientServiceId) form.set("clientServiceId", values.clientServiceId);
    setSaving(true);
    setError(null);
    setMessage(null);
    const url = canEdit && userId ? `/api/admin/users/${userId}/dni` : "/api/user/dni";
    const res = await authFetch(url, { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { error?: string; syncedToDrive?: boolean };
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se ha podido guardar el DNI en Drive.");
      return;
    }
    setMessage(data.syncedToDrive ? "DNI guardado en la carpeta de Drive." : "DNI guardado.");
    await loadDni();
  };

  const upload = async (slot: "capital", file: File) => {
    const form = new FormData();
    form.set("slot", slot);
    form.set("file", file);
    if (values.clientServiceId) form.set("clientServiceId", values.clientServiceId);
    if (values.contactRequestId) form.set("contactRequestId", values.contactRequestId);
    setSaving(true);
    setError(null);
    const res = await authFetch("/api/servicios/intake/files", { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { error?: string; file?: IntakeSnapshot["files"][number] };
    setSaving(false);
    if (!res.ok || !data.file) {
      setError(data.error || "No se ha podido subir el archivo.");
      return;
    }
    setValues((current) => ({ ...current, files: [data.file!, ...current.files] }));
    setMessage("Archivo guardado en el expediente.");
    router.refresh();
  };

  const remove = async (id: string) => {
    setSaving(true);
    setError(null);
    const res = await authFetch(`/api/servicios/intake/files/${id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "No se ha podido quitar el archivo.");
      return;
    }
    setValues((current) => ({ ...current, files: current.files.filter((file) => file.id !== id) }));
    router.refresh();
  };

  const company = (
    <section className={variant === "page" ? "rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6" : "space-y-3"}>
      {variant === "page" ? <h2 className="text-lg font-bold text-[var(--brand-dark)]">Datos de la sociedad</h2> : <p className="text-sm font-semibold text-slate-800">Datos de la sociedad</p>}
      <div className={variant === "page" ? "mt-4 grid gap-4 sm:grid-cols-2" : "grid gap-3"}>
        <Field label="Denominación social asignada" value={values.companyName} onChange={(value) => set("companyName", value)} readOnly={!canEdit} />
        <Field label="Socios y participación" value={values.shareholders} onChange={(value) => set("shareholders", value)} area readOnly={!canEdit} />
        <Field label="Capital social" value={values.shareCapital} onChange={(value) => set("shareCapital", value)} readOnly={!canEdit} />
        <Field label="Domicilio social" value={values.registeredOffice} onChange={(value) => set("registeredOffice", value)} readOnly={!canEdit} />
        <Field label="Régimen de administración" value={values.managementRegime} onChange={(value) => set("managementRegime", value)} readOnly={!canEdit} />
      </div>
    </section>
  );

  const tasks = (
    <section className={variant === "page" ? "rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6" : "space-y-3"}>
      <h2 className={variant === "page" ? "text-lg font-bold text-[var(--brand-dark)]" : "text-sm font-semibold text-slate-800"}>
        Qué necesitamos de ti ahora
      </h2>
      <ul className="mt-4 divide-y divide-[#f3eef8]">
        <Task done={Boolean(dniFront && dniBack)} title="Sube tu DNI o NIE (ambas caras)" hint="Se guarda en tu carpeta de Drive, dentro de Identidad.">
          <DniDriveSlot
            front={dniFront}
            back={dniBack}
            driveFolderUrl={driveFolderUrl}
            disabled={saving || (canEdit && !userId)}
            onUpload={uploadDni}
          />
        </Task>
        <Task done={Boolean(values.proposedNames.trim())} title="5 nombres propuestos para la sociedad" hint="Los revisamos en el Registro Mercantil Central">
          <textarea
            value={values.proposedNames}
            onChange={(event) => set("proposedNames", event.target.value)}
            rows={3}
            readOnly={!canEdit}
            placeholder="Un nombre por línea"
            className="w-full rounded-xl border border-[#ece6f5] px-3 py-2 text-sm read-only:bg-[#faf8fd]"
          />
        </Task>
        <Task done={Boolean(values.constitutionDetails.trim())} title="Complete el formulario de constitución" hint="Reparto de participaciones y documentación de los socios">
          <textarea
            value={values.constitutionDetails}
            onChange={(event) => set("constitutionDetails", event.target.value)}
            rows={3}
            readOnly={!canEdit}
            placeholder="Socios, participaciones y documentos"
            className="w-full rounded-xl border border-[#ece6f5] px-3 py-2 text-sm read-only:bg-[#faf8fd]"
          />
        </Task>
        <Task done={values.digitalSignature === "SI" || values.digitalSignature === "NO"} title="¿El administrador tiene ya firma digital FNMT?" hint="Si no la tiene, la tramitamos nosotros">
          <select
            value={values.digitalSignature}
            onChange={(event) => set("digitalSignature", event.target.value)}
            disabled={!canEdit}
            className="rounded-xl border border-[#ece6f5] px-3 py-2 text-sm disabled:bg-[#faf8fd]"
          >
            <option value="">Sin responder</option>
            <option value="SI">Sí, ya la tiene</option>
            <option value="NO">No, hay que tramitarla</option>
          </select>
        </Task>
        <Task done={values.bankOffice === "SI" || values.bankOffice === "NO"} title="¿Quieres que te tramitemos la apertura de la cuenta bancaria?" hint="Indica sí o no. Si es sí, nos encargamos de abrir la cuenta de la sociedad.">
          <select
            value={values.bankOffice}
            onChange={(event) => set("bankOffice", event.target.value)}
            disabled={!canEdit}
            className="rounded-xl border border-[#ece6f5] px-3 py-2 text-sm disabled:bg-[#faf8fd]"
          >
            <option value="">Sin responder</option>
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </Task>
        <Task done={values.files.some((file) => file.slot === "capital")} title="Certificado bancario del depósito del capital social" hint="Una vez realizado el ingreso en la cuenta de la sociedad">
          <FileSlot slot="capital" files={values.files} disabled={saving} canEdit={canEdit} onUpload={upload} onRemove={remove} />
        </Task>
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canEdit ? (
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar datos"}
          </button>
        ) : (
          <p className="text-xs text-[var(--foreground)]/55">Los datos del servicio los actualiza el equipo de Diligenz. Tú puedes subir el DNI.</p>
        )}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </section>
  );

  if (variant === "admin") {
    return (
      <div className="space-y-5 rounded-2xl border border-slate-200 p-3">
        <p className="text-xs text-slate-500">Estos datos se guardan en el expediente. No se envía ningún correo.</p>
        {company}
        {tasks}
      </div>
    );
  }

  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
        {company}
        <div className="space-y-4">{children}</div>
      </div>
      {tasks}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  area = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground)]/45">{label}</span>
      {area ? (
        <textarea value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-[#ece6f5] px-3 py-2 text-sm read-only:bg-[#faf8fd]" />
      ) : (
        <input value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-[#ece6f5] px-3 py-2 text-sm read-only:bg-[#faf8fd]" />
      )}
    </label>
  );
}

function DniDriveSlot({
  front,
  back,
  driveFolderUrl,
  disabled,
  onUpload,
}: {
  front: DniSide;
  back: DniSide;
  driveFolderUrl: string | null;
  disabled: boolean;
  onUpload: (side: "front" | "back", file: File) => void;
}) {
  return (
    <div className="space-y-3">
      <DniSideInput label="Anverso" side="front" file={front} disabled={disabled} onUpload={onUpload} />
      <DniSideInput label="Reverso" side="back" file={back} disabled={disabled} onUpload={onUpload} />
      {driveFolderUrl ? (
        <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-semibold text-[var(--brand-primary)]">
          Abrir la carpeta de Drive
        </a>
      ) : (
        <p className="text-xs text-[var(--foreground)]/55">Al subir el anverso o el reverso se crea la carpeta de Drive y el archivo queda en Identidad.</p>
      )}
    </div>
  );
}

function DniSideInput({
  label,
  side,
  file,
  disabled,
  onUpload,
}: {
  label: string;
  side: "front" | "back";
  file: DniSide;
  disabled: boolean;
  onUpload: (side: "front" | "back", file: File) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--brand-dark)]">{label}</p>
      {file ? (
        <p className="text-xs text-[var(--foreground)]/60">
          {file.name}
          {file.syncedToDrive ? " · en Drive" : ""}
        </p>
      ) : null}
      <input
        type="file"
        disabled={disabled}
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (next) onUpload(side, next);
          event.target.value = "";
        }}
        className="mt-1 block w-full text-sm"
      />
    </div>
  );
}

function Task({
  done,
  title,
  hint,
  children,
}: {
  done: boolean;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <li className="py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${done ? "border-[#7c4dff] bg-[#7c4dff] text-white" : "border-[#ddd4ea]"}`}>
          {done ? <Check className="h-3 w-3" aria-hidden /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--brand-dark)]">{title}</p>
          <p className="text-xs text-[var(--foreground)]/55">{hint}</p>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </li>
  );
}

function FileSlot({
  slot,
  files,
  disabled,
  canEdit,
  onUpload,
  onRemove,
}: {
  slot: "capital";
  files: IntakeSnapshot["files"];
  disabled: boolean;
  canEdit: boolean;
  onUpload: (slot: "capital", file: File) => void;
  onRemove: (id: string) => void;
}) {
  const own = files.filter((file) => file.slot === slot);
  return (
    <div className="space-y-2">
      {own.map((file) => (
        <div key={file.id} className="flex items-center justify-between gap-3 text-sm">
          <a href={`/api/servicios/intake/files/${file.id}`} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-[var(--brand-primary)]">
            {file.name}
          </a>
          {canEdit ? (
            <button type="button" onClick={() => void onRemove(file.id)} className="shrink-0 text-xs font-semibold text-slate-500 hover:text-red-600">
              Quitar
            </button>
          ) : null}
        </div>
      ))}
      {canEdit ? (
        <input
          type="file"
          disabled={disabled}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(slot, file);
            event.target.value = "";
          }}
          className="block w-full text-sm"
        />
      ) : own.length === 0 ? (
        <p className="text-xs text-[var(--foreground)]/55">Lo añadirá el equipo de Diligenz.</p>
      ) : null}
    </div>
  );
}
