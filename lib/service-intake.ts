export type IntakeFileView = { id: string; name: string; slot: string };

export type IntakeSnapshot = {
  clientServiceId: string | null;
  contactRequestId: string | null;
  companyName: string;
  shareholders: string;
  shareCapital: string;
  registeredOffice: string;
  managementRegime: string;
  proposedNames: string;
  constitutionDetails: string;
  digitalSignature: "" | "SI" | "NO";
  bankOffice: string;
  files: IntakeFileView[];
};

const TEXT_LIMITS = {
  companyName: 180,
  shareholders: 4000,
  shareCapital: 80,
  registeredOffice: 300,
  managementRegime: 180,
  proposedNames: 2000,
  constitutionDetails: 4000,
  bankOffice: 300,
} as const;

export type IntakeField = keyof typeof TEXT_LIMITS | "digitalSignature";

const fileSelect = { id: true, name: true, slot: true } as const;

export function emptyIntake(target: { clientServiceId?: string | null; contactRequestId?: string | null }): IntakeSnapshot {
  return {
    clientServiceId: target.clientServiceId ?? null,
    contactRequestId: target.contactRequestId ?? null,
    companyName: "",
    shareholders: "",
    shareCapital: "",
    registeredOffice: "",
    managementRegime: "",
    proposedNames: "",
    constitutionDetails: "",
    digitalSignature: "",
    bankOffice: "",
    files: [],
  };
}

function asText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function toIntakeSnapshot(
  row: {
    clientServiceId: string | null;
    contactRequestId: string | null;
    companyName: string | null;
    shareholders: string | null;
    shareCapital: string | null;
    registeredOffice: string | null;
    managementRegime: string | null;
    proposedNames: string | null;
    constitutionDetails: string | null;
    digitalSignature: string | null;
    bankOffice: string | null;
    files: IntakeFileView[];
  } | null,
  target: { clientServiceId?: string | null; contactRequestId?: string | null }
): IntakeSnapshot {
  const base = emptyIntake(target);
  if (!row) return base;
  const signature = row.digitalSignature === "SI" || row.digitalSignature === "NO" ? row.digitalSignature : "";
  return {
    clientServiceId: row.clientServiceId ?? target.clientServiceId ?? null,
    contactRequestId: row.contactRequestId ?? target.contactRequestId ?? null,
    companyName: asText(row.companyName),
    shareholders: asText(row.shareholders),
    shareCapital: asText(row.shareCapital),
    registeredOffice: asText(row.registeredOffice),
    managementRegime: asText(row.managementRegime),
    proposedNames: asText(row.proposedNames),
    constitutionDetails: asText(row.constitutionDetails),
    digitalSignature: signature,
    bankOffice: asText(row.bankOffice),
    files: row.files,
  };
}

export function cleanIntakeFields(body: Record<string, unknown>) {
  const data: {
    companyName: string | null;
    shareholders: string | null;
    shareCapital: string | null;
    registeredOffice: string | null;
    managementRegime: string | null;
    proposedNames: string | null;
    constitutionDetails: string | null;
    digitalSignature: string | null;
    bankOffice: string | null;
  } = {
    companyName: null,
    shareholders: null,
    shareCapital: null,
    registeredOffice: null,
    managementRegime: null,
    proposedNames: null,
    constitutionDetails: null,
    digitalSignature: null,
    bankOffice: null,
  };

  for (const key of Object.keys(TEXT_LIMITS) as (keyof typeof TEXT_LIMITS)[]) {
    const raw = body[key];
    if (raw !== undefined && typeof raw !== "string") return { error: "Hay un dato que no es texto." as const };
    const value = typeof raw === "string" ? raw.trim().slice(0, TEXT_LIMITS[key]) : "";
    data[key] = value || null;
  }

  const signature = body.digitalSignature;
  if (signature !== undefined && signature !== "" && signature !== "SI" && signature !== "NO") {
    return { error: "Indica si el administrador tiene firma digital." as const };
  }
  data.digitalSignature = signature === "SI" || signature === "NO" ? signature : null;
  return { data };
}
