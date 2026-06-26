import { prisma } from "@/lib/prisma";
import type { DocumentLink } from "@/lib/company-display";
import { driveFolderUrl, parseDriveFolderId } from "./folder-name";
import {
  findOrCreateSubfolder,
  isGoogleDriveConfigured,
  shareFolderWithUser,
} from "./client";
import { ensureUserDriveFolder } from "./user-drive";

const COMPANY_DOCS_LABEL = "Documento de empresa";

function sanitizeSubfolderName(name: string): string {
  const trimmed = name.trim().slice(0, 80) || "Empresa";
  return trimmed.replace(/[/\\?%*:|"<>]/g, "-");
}

function clientShareRole(): "reader" | "writer" {
  const role = process.env.GOOGLE_DRIVE_CLIENT_SHARE_ROLE?.trim().toLowerCase();
  return role === "writer" ? "writer" : "reader";
}

export async function ensureCompanyDriveFolder(opts: {
  companyId: string;
  ownerId: string;
  companyName: string;
}): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { id: opts.companyId },
    select: { documentLinks: true },
  });
  if (!company) return null;

  const existing = company.documentLinks as DocumentLink[] | null;
  const existingUrl = Array.isArray(existing)
    ? existing.find((l) => l.url?.includes("drive.google.com"))?.url
    : null;
  if (existingUrl) return existingUrl;

  if (!isGoogleDriveConfigured()) return null;

  const owner = await prisma.user.findUnique({
    where: { id: opts.ownerId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      documentsDriveFolderUrl: true,
    },
  });
  if (!owner) return null;

  const userFolderId = await ensureUserDriveFolder({
    userId: owner.id,
    role: owner.role,
    personName: owner.name?.trim() || owner.email.split("@")[0],
    userEmail: owner.email,
  });
  if (!userFolderId) return null;

  try {
    const subfolderName = sanitizeSubfolderName(opts.companyName);
    const companyFolderId = await findOrCreateSubfolder(userFolderId, subfolderName);
    const url = driveFolderUrl(companyFolderId);

    if (process.env.GOOGLE_DRIVE_SHARE_WITH_CLIENT !== "false") {
      try {
        await shareFolderWithUser(companyFolderId, owner.email, clientShareRole());
      } catch (err) {
        console.error("[google-drive] compartir carpeta empresa:", err);
      }
    }

    const links: DocumentLink[] = [{ label: COMPANY_DOCS_LABEL, url }];
    await prisma.company.update({
      where: { id: opts.companyId },
      data: { documentLinks: links },
    });

    return url;
  } catch (err) {
    console.error("[google-drive] carpeta empresa:", err);
    return null;
  }
}

export function companyDriveUrlFromLinks(documentLinks: unknown): string | null {
  if (!Array.isArray(documentLinks)) return null;
  for (const item of documentLinks) {
    if (item && typeof item === "object" && "url" in item) {
      const url = String((item as DocumentLink).url);
      if (url.includes("drive.google.com")) return url;
    }
  }
  return null;
}

/** Comparte la carpeta del negocio (no la carpeta personal del vendedor) con un comprador. */
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

  let folderUrl = companyDriveUrlFromLinks(company.documentLinks);
  if (!folderUrl) {
    folderUrl =
      (await ensureCompanyDriveFolder({
        companyId: opts.companyId,
        ownerId: opts.ownerId,
        companyName: opts.companyName,
      })) ?? null;
  }
  const folderId = folderUrl ? parseDriveFolderId(folderUrl) : null;
  if (!folderId) return;

  try {
    await shareFolderWithUser(folderId, opts.email, "reader");
  } catch (err) {
    console.error("[google-drive] compartir carpeta negocio con comprador:", err);
  }
}
