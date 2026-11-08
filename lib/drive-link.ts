const DRIVE_URL_MAX = 2048;

function isGoogleDriveDocsHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "drive.google.com" ||
    host.endsWith(".drive.google.com") ||
    host === "docs.google.com" ||
    host.endsWith(".docs.google.com")
  );
}

/** Cadena vacía borra el enlace. Solo admite Drive o Documentos de Google. */
export function parseDriveLink(raw: unknown): { url: string | null } | { error: string } {
  if (raw === null) return { url: null };
  if (typeof raw !== "string") return { error: "El enlace tiene que ser una dirección de Drive." };
  const value = raw.trim();
  if (!value) return { url: null };
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { error: "El enlace de Drive no es válido." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "El enlace tiene que empezar por https." };
  }
  if (!isGoogleDriveDocsHost(parsed.hostname)) {
    return { error: "El enlace tiene que ser de Google Drive o Documentos." };
  }
  return { url: value.slice(0, DRIVE_URL_MAX) };
}
