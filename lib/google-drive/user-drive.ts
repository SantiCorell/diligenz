import type { DniDocumentSide, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildClientDriveFolderName,
  parseDriveFolderId,
} from "./folder-name";
import {
  downloadFileFromFolder,
  findSubfolder,
  isGoogleDriveConfigured,
  renameDriveFolder,
  uploadFileToFolder,
} from "./client";
import { buildDriveFileName } from "./document-sync";

/**
 * Devuelve la carpeta ya enlazada en el usuario. No crea carpetas ni borra el enlace guardado.
 */
export async function ensureUserDriveFolder(opts: {
  userId: string;
  role?: UserRole;
  personName?: string;
  companyName?: string | null;
  userEmail?: string | null;
}): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { documentsDriveFolderUrl: true },
  });
  if (!user?.documentsDriveFolderUrl) return null;
  return parseDriveFolderId(user.documentsDriveFolderUrl);
}

/** Compatibilidad: ya no crea la carpeta al alta. Solo lee el enlace guardado. */
export async function provisionUserDriveFolder(user: {
  id: string;
  role: UserRole;
  name: string | null;
  email: string;
}): Promise<string | null> {
  return ensureUserDriveFolder({ userId: user.id });
}

export async function syncUserDriveFolderName(opts: {
  userId: string;
  role: UserRole;
  personName: string;
  companyName?: string | null;
}): Promise<void> {
  if (!isGoogleDriveConfigured()) return;

  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { documentsDriveFolderUrl: true },
  });
  const folderId = user?.documentsDriveFolderUrl
    ? parseDriveFolderId(user.documentsDriveFolderUrl)
    : null;
  if (!folderId) return;

  const folderName = buildClientDriveFolderName({
    role: opts.role,
    personName: opts.personName,
    companyName: opts.companyName,
  });

  try {
    await renameDriveFolder(folderId, folderName);
  } catch (err) {
    console.error("[google-drive] renombrar carpeta:", err instanceof Error ? err.message : "error");
  }
}

export async function uploadUserDriveDocument(opts: {
  userId: string;
  fileName: string;
  mimeType: string;
  content: Buffer | Uint8Array;
  subfolder?: string;
}): Promise<boolean> {
  if (!isGoogleDriveConfigured()) return false;

  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { documentsDriveFolderUrl: true },
  });
  if (!user) return false;

  const folderId = user.documentsDriveFolderUrl
    ? parseDriveFolderId(user.documentsDriveFolderUrl)
    : null;
  if (!folderId) return false;

  let targetFolderId = folderId;
  if (opts.subfolder?.trim()) {
    const existing = await findSubfolder(folderId, opts.subfolder.trim());
    if (existing) targetFolderId = existing;
  }

  try {
    await uploadFileToFolder({
      folderId: targetFolderId,
      fileName: opts.fileName,
      mimeType: opts.mimeType,
      content: opts.content,
    });
    return true;
  } catch (err) {
    console.error("[google-drive] subir documento:", err instanceof Error ? err.message : "error");
    return false;
  }
}

export async function downloadUserDniFromDrive(opts: {
  userId: string;
  side: DniDocumentSide;
  originalFileName: string;
}): Promise<{ buffer: Buffer; mimeType: string; name: string } | null> {
  if (!isGoogleDriveConfigured()) return null;

  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { documentsDriveFolderUrl: true },
  });
  const folderId = user?.documentsDriveFolderUrl
    ? parseDriveFolderId(user.documentsDriveFolderUrl)
    : null;
  if (!folderId) return null;

  try {
    const identidadId = await findSubfolder(folderId, "Identidad");
    const kind = opts.side === "FRONT" ? "dni-front" : "dni-back";
    const driveFileName = buildDriveFileName({
      kind,
      originalName: opts.originalFileName,
    });
    const folders = identidadId ? [identidadId, folderId] : [folderId];
    for (const id of folders) {
      const downloaded = await downloadFileFromFolder({
        folderId: id,
        nameIncludes: driveFileName,
      });
      if (downloaded) return downloaded;
      const bySide = await downloadFileFromFolder({
        folderId: id,
        nameIncludes: opts.side === "FRONT" ? "anverso" : "reverso",
      });
      if (bySide) return bySide;
    }
    return null;
  } catch (err) {
    console.error("[google-drive] descargar DNI:", err instanceof Error ? err.message : "error");
    return null;
  }
}
