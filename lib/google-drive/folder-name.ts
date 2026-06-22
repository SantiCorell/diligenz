import type { UserRole } from "@prisma/client";

/** Ej: VENDEDOR. LIMPIEZAS SILLERO - RAQUEL · COMPRADOR. HECTOR FABIAN */
export function buildClientDriveFolderName(opts: {
  role: UserRole;
  personName: string;
  companyName?: string | null;
}): string {
  const roleLabel =
    opts.role === "SELLER"
      ? "VENDEDOR"
      : opts.role === "PROFESSIONAL"
        ? "PROFESIONAL"
        : "COMPRADOR";

  const person = opts.personName.trim().replace(/\s+/g, " ").toUpperCase();
  const company = opts.companyName?.trim().replace(/\s+/g, " ").toUpperCase();

  if (company && company !== person) {
    return `${roleLabel}. ${company} - ${person}`;
  }
  return `${roleLabel}. ${person}`;
}

export function driveFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export function parseDriveFolderId(urlOrId: string): string | null {
  const raw = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{10,}$/.test(raw) && !raw.includes("/")) return raw;
  try {
    const u = new URL(raw);
    const m = u.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}
