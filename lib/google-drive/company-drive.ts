import { prisma } from "@/lib/prisma";
import type { DocumentLink } from "@/lib/company-display";
import { parseDriveFolderId } from "./folder-name";
import { isGoogleDriveConfigured, shareFolderWithUser } from "./client";

export async function ensureCompanyDriveFolder(opts: {
  companyId: string;
  ownerId?: string;
  companyName?: string;
}): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { id: opts.companyId },
    select: { documentLinks: true },
  });
  if (!company) return null;
  return companyDriveUrlFromLinks(company.documentLinks);
}

function isDriveDocsUrl(url: string): boolean {
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}

export function companyDriveUrlFromLinks(documentLinks: unknown): string | null {
  if (!Array.isArray(documentLinks)) return null;
  for (const item of documentLinks) {
    if (item && typeof item === "object" && "url" in item) {
      const url = String((item as DocumentLink).url);
      if (isDriveDocsUrl(url)) return url;
    }
  }
  return null;
}

/** Comparte la carpeta del negocio ya enlazada. No crea carpetas. */
export async function shareCompanyDriveFolderWithEmail(opts: {
  companyId: string;
  ownerId: string;
  companyName: string;
  email: string;
}): Promise<void> {
  if (!isGoogleDriveConfigured()) return;

  const company = await prisma.company.findUnique({
    where: { id: opts.companyId },
    select: { documentLinks: true },
  });
  if (!company) return;

  const folderUrl = companyDriveUrlFromLinks(company.documentLinks);
  const folderId = folderUrl ? parseDriveFolderId(folderUrl) : null;
  if (!folderId) return;

  try {
    await shareFolderWithUser(folderId, opts.email, "reader");
  } catch (err) {
    console.error("[google-drive] compartir carpeta negocio con comprador:", err);
  }
}
