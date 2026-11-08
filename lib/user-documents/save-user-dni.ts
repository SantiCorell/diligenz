import type { DniDocumentSide, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildDriveFileName, syncDocumentToUserDrive } from "@/lib/google-drive/document-sync";
import { findOrCreateSubfolder, uploadFileToFolder } from "@/lib/google-drive/client";
import { parseDriveFolderId } from "@/lib/google-drive/folder-name";
import { ensureUserDriveFolder } from "@/lib/google-drive/user-drive";
import { getDniVerificationStatus } from "@/lib/user-documents/dni-status";
import { removeDniFile, saveDniFile, useLocalDniDisk } from "@/lib/user-documents/dni";

export async function saveUserDni(opts: {
  userId: string;
  role: UserRole;
  personName: string;
  email: string;
  side: DniDocumentSide;
  file: File;
  clientServiceId?: string | null;
}) {
  const mimeType = opts.file.type || "application/octet-stream";
  const bytes = Buffer.from(await opts.file.arrayBuffer());
  const personName = opts.personName.trim() || opts.email.split("@")[0] || "Cliente";

  let driveSyncedAt: Date | null = null;
  let driveError: string | null = null;

  try {
    const folderId = await ensureUserDriveFolder({
      userId: opts.userId,
      role: opts.role,
      personName,
      userEmail: opts.email,
    });
    if (!folderId) driveError = "no_folder";
  } catch (error) {
    driveError = error instanceof Error ? error.message : "folder_error";
    console.error("[user/dni] ensure folder:", error);
  }

  const kind = opts.side === "FRONT" ? "dni-front" : "dni-back";
  if (!driveError) {
    try {
      const synced = await syncDocumentToUserDrive({
        userId: opts.userId,
        kind,
        originalFileName: opts.file.name,
        mimeType,
        content: bytes,
      });
      driveSyncedAt = synced ? new Date() : null;
      if (!synced) driveError = "upload_failed";
    } catch (error) {
      driveError = error instanceof Error ? error.message : "upload_error";
      console.error("[user/dni] drive sync:", error);
    }
  }

  if (driveSyncedAt && opts.clientServiceId) {
    await copyDniIntoServiceFolder({
      userId: opts.userId,
      clientServiceId: opts.clientServiceId,
      side: opts.side,
      originalFileName: opts.file.name,
      mimeType,
      bytes,
    });
  }

  if (!useLocalDniDisk() && !driveSyncedAt) {
    return { error: driveError ?? "drive_sync_failed" as const };
  }

  const storage = await saveDniFile({
    userId: opts.userId,
    side: opts.side,
    originalName: opts.file.name,
    mimeType,
    bytes,
  });

  const existing = await prisma.userDniDocument.findUnique({
    where: { userId_side: { userId: opts.userId, side: opts.side } },
  });
  if (existing) await removeDniFile(existing.storagePath);

  await prisma.$transaction([
    prisma.userDniDocument.upsert({
      where: { userId_side: { userId: opts.userId, side: opts.side } },
      create: {
        userId: opts.userId,
        side: opts.side,
        name: opts.file.name,
        storagePath: storage.storagePath,
        mimeType,
        size: storage.size,
        driveSyncedAt,
      },
      update: {
        name: opts.file.name,
        storagePath: storage.storagePath,
        mimeType,
        size: storage.size,
        driveSyncedAt,
      },
    }),
    prisma.user.update({
      where: { id: opts.userId },
      data: { dniVerified: false },
    }),
  ]);

  const docs = await prisma.userDniDocument.findMany({
    where: { userId: opts.userId },
    select: { side: true },
  });
  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { documentsDriveFolderUrl: true },
  });
  const verificationStatus = getDniVerificationStatus({
    dniVerified: false,
    hasFront: docs.some((doc) => doc.side === "FRONT"),
    hasBack: docs.some((doc) => doc.side === "BACK"),
  });

  return {
    ok: true as const,
    side: opts.side === "FRONT" ? "front" : "back",
    syncedToDrive: Boolean(driveSyncedAt),
    driveFolderUrl: user?.documentsDriveFolderUrl ?? null,
    verificationStatus,
    pendingReview: verificationStatus === "pending",
    driveError,
  };
}

async function copyDniIntoServiceFolder(opts: {
  userId: string;
  clientServiceId: string;
  side: DniDocumentSide;
  originalFileName: string;
  mimeType: string;
  bytes: Buffer;
}) {
  const service = await prisma.clientService.findFirst({
    where: { id: opts.clientServiceId, userId: opts.userId },
    select: { documentsUrl: true },
  });
  const folderId = service?.documentsUrl ? parseDriveFolderId(service.documentsUrl) : null;
  if (!folderId) return;

  try {
    const identidadId = await findOrCreateSubfolder(folderId, "Identidad");
    await uploadFileToFolder({
      folderId: identidadId,
      fileName: buildDriveFileName({
        kind: opts.side === "FRONT" ? "dni-front" : "dni-back",
        originalName: opts.originalFileName,
      }),
      mimeType: opts.mimeType,
      content: opts.bytes,
    });
  } catch (error) {
    console.error("[user/dni] copia a la carpeta del servicio:", error instanceof Error ? error.message : error);
  }
}
