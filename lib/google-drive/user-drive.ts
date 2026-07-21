import type { DniDocumentSide, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildClientDriveFolderName,
  driveFolderUrl,
  parseDriveFolderId,
} from "./folder-name";
import {
  createClientFolder,
  downloadFileFromFolder,
  findOrCreateSubfolder,
  isDriveFolderAccessible,
  isGoogleDriveConfigured,
  renameDriveFolder,
  shareFolderWithUser,
  uploadFileToFolder,
} from "./client";
import { buildDriveFileName } from "./document-sync";

function clientShareRole(): "reader" | "writer" {
  const role = process.env.GOOGLE_DRIVE_CLIENT_SHARE_ROLE?.trim().toLowerCase();
  return role === "writer" ? "writer" : "reader";
}

async function shareUserDriveFolder(folderId: string, clientEmail: string): Promise<void> {
  if (process.env.GOOGLE_DRIVE_SHARE_WITH_CLIENT !== "false") {
    try {
      await shareFolderWithUser(folderId, clientEmail, clientShareRole());
    } catch (err) {
      console.error("[google-drive] compartir carpeta con cliente:", err);
    }
  }

  const adminEmail = process.env.GOOGLE_DRIVE_ADMIN_EMAIL?.trim();
  if (adminEmail && adminEmail.toLowerCase() !== clientEmail.toLowerCase()) {
    try {
      await shareFolderWithUser(folderId, adminEmail, "writer");
    } catch (err) {
      console.error("[google-drive] compartir carpeta con admin:", err);
    }
  }
}

/**
 * Crea (o reutiliza) la carpeta CLIENTES del usuario.
 * Política lazy: no llamar en registro/OAuth; solo cuando haya contenido
 * (DNI, mandato/NDA, subcarpeta de empresa o valoración).
 */
export async function ensureUserDriveFolder(opts: {
  userId: string;
  role: UserRole;
  personName: string;
  companyName?: string | null;
  userEmail?: string | null;
}): Promise<string | null> {
  if (!isGoogleDriveConfigured()) {
    console.warn("[google-drive] Drive no configurado; no se crea carpeta para", opts.userId);
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { documentsDriveFolderUrl: true, email: true },
  });
  if (!user) return null;

  const existingId = user.documentsDriveFolderUrl
    ? parseDriveFolderId(user.documentsDriveFolderUrl)
    : null;
  if (existingId) {
    const accessible = await isDriveFolderAccessible(existingId);
    if (accessible) return existingId;

    console.warn(
      "[google-drive] carpeta guardada inaccesible; se recreará para",
      opts.userId,
      existingId
    );
    await prisma.user.update({
      where: { id: opts.userId },
      data: { documentsDriveFolderUrl: null },
    });
  }

  const folderName = buildClientDriveFolderName({
    role: opts.role,
    personName: opts.personName,
    companyName: opts.companyName,
  });

  try {
    const folderId = await createClientFolder(folderName);
    const url = driveFolderUrl(folderId);
    await prisma.user.update({
      where: { id: opts.userId },
      data: { documentsDriveFolderUrl: url },
    });
    await shareUserDriveFolder(folderId, opts.userEmail ?? user.email);
    return folderId;
  } catch (err) {
    console.error("[google-drive] crear carpeta cliente:", err);
    return null;
  }
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
    console.error("[google-drive] renombrar carpeta:", err);
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
    select: { documentsDriveFolderUrl: true, role: true, name: true, email: true },
  });
  if (!user) return false;

  let folderId = user.documentsDriveFolderUrl
    ? parseDriveFolderId(user.documentsDriveFolderUrl)
    : null;

  if (folderId) {
    const accessible = await isDriveFolderAccessible(folderId);
    if (!accessible) {
      await prisma.user.update({
        where: { id: opts.userId },
        data: { documentsDriveFolderUrl: null },
      });
      folderId = null;
    }
  }

  if (!folderId) {
    folderId = await ensureUserDriveFolder({
      userId: opts.userId,
      role: user.role,
      personName: user.name?.trim() || user.email.split("@")[0],
      userEmail: user.email,
    });
  }
  if (!folderId) return false;

  let targetFolderId = folderId;
  if (opts.subfolder?.trim()) {
    targetFolderId = await findOrCreateSubfolder(folderId, opts.subfolder.trim());
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
    const msg = err instanceof Error ? err.message : String(err);
    const notFound =
      msg.includes("File not found") ||
      msg.includes("notFound") ||
      msg.includes("404");

    if (!notFound) {
      console.error("[google-drive] subir documento:", err);
      return false;
    }

    console.warn("[google-drive] carpeta inválida al subir; reintentando para", opts.userId);
    await prisma.user.update({
      where: { id: opts.userId },
      data: { documentsDriveFolderUrl: null },
    });

    const retryFolderId = await ensureUserDriveFolder({
      userId: opts.userId,
      role: user.role,
      personName: user.name?.trim() || user.email.split("@")[0],
      userEmail: user.email,
    });
    if (!retryFolderId) return false;

    let retryTargetId = retryFolderId;
    if (opts.subfolder?.trim()) {
      retryTargetId = await findOrCreateSubfolder(retryFolderId, opts.subfolder.trim());
    }

    try {
      await uploadFileToFolder({
        folderId: retryTargetId,
        fileName: opts.fileName,
        mimeType: opts.mimeType,
        content: opts.content,
      });
      return true;
    } catch (retryErr) {
      console.error("[google-drive] subir documento (reintento):", retryErr);
      return false;
    }
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
    const identidadId = await findOrCreateSubfolder(folderId, "Identidad");
    const kind = opts.side === "FRONT" ? "dni-front" : "dni-back";
    const driveFileName = buildDriveFileName({
      kind,
      originalName: opts.originalFileName,
    });
    const downloaded = await downloadFileFromFolder({
      folderId: identidadId,
      nameIncludes: driveFileName,
    });
    if (downloaded) return downloaded;

    return downloadFileFromFolder({
      folderId: identidadId,
      nameIncludes: opts.side === "FRONT" ? "anverso" : "reverso",
    });
  } catch (err) {
    console.error("[google-drive] descargar DNI:", err);
    return null;
  }
}
