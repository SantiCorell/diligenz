import { isGoogleDriveConfigured } from "./client";
import { uploadUserDriveDocument } from "./user-drive";

export type DriveDocumentKind =
  | "mandato"
  | "dni-front"
  | "dni-back"
  | "empresa";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-áéíóúñÁÉÍÓÚÑ ]/g, "_").replace(/\s+/g, " ").trim();
}

export function buildDriveFileName(opts: {
  kind: DriveDocumentKind;
  originalName: string;
  companyName?: string | null;
}): string {
  const base = sanitizeFileName(opts.originalName);
  switch (opts.kind) {
    case "mandato":
      return base.toLowerCase().includes("mandato") ? base : `Mandato-${base}`;
    case "dni-front":
      return base.toLowerCase().includes("dni") ? base : `DNI-anverso-${base}`;
    case "dni-back":
      return base.toLowerCase().includes("dni") ? base : `DNI-reverso-${base}`;
    case "empresa": {
      const company = opts.companyName
        ? sanitizeFileName(opts.companyName).slice(0, 60)
        : "proyecto";
      return `Empresa-${company}-${base}`;
    }
    default:
      return base;
  }
}

export async function syncDocumentToUserDrive(opts: {
  userId: string;
  kind: DriveDocumentKind;
  originalFileName: string;
  mimeType: string;
  content: Buffer | Uint8Array;
  companyName?: string | null;
}): Promise<boolean> {
  if (!isGoogleDriveConfigured()) {
    console.warn("[google-drive] Drive no configurado; no se sube", opts.kind, "para", opts.userId);
    return false;
  }

  const fileName = buildDriveFileName({
    kind: opts.kind,
    originalName: opts.originalFileName,
    companyName: opts.companyName,
  });

  const subfolder =
    opts.kind === "empresa" && opts.companyName
      ? `Empresa - ${sanitizeFileName(opts.companyName).slice(0, 80)}`
      : opts.kind === "dni-front" || opts.kind === "dni-back"
        ? "Identidad"
        : undefined;

  return uploadUserDriveDocument({
    userId: opts.userId,
    fileName,
    mimeType: opts.mimeType,
    content: opts.content,
    subfolder,
  });
}
