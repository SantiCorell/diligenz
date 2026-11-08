import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import type { DniDocumentSide } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { downloadUserDniFromDrive } from "@/lib/google-drive/user-drive";
import { dniAbsolutePath, isCloudOnlyDniPath } from "@/lib/user-documents/dni";

export async function loadUserDniFile(opts: {
  userId: string;
  side: DniDocumentSide;
}): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
  const doc = await prisma.userDniDocument.findUnique({
    where: { userId_side: { userId: opts.userId, side: opts.side } },
  });
  if (!doc) return null;

  let buffer: Buffer | null = null;
  let mimeType = doc.mimeType ?? "application/octet-stream";
  let fileName = doc.name;

  if (!isCloudOnlyDniPath(doc.storagePath)) {
    try {
      buffer = await readFile(dniAbsolutePath(doc.storagePath));
    } catch {
      buffer = null;
    }
  }

  if (!buffer) {
    const fromDrive = await downloadUserDniFromDrive({
      userId: opts.userId,
      side: opts.side,
      originalFileName: doc.name,
    });
    if (!fromDrive) return null;
    buffer = fromDrive.buffer;
    mimeType = fromDrive.mimeType;
    fileName = fromDrive.name;
  }

  return { buffer, mimeType, fileName };
}

export function dniFileResponse(file: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}) {
  const safeName = file.fileName.replace(/"/g, "%22");
  const isImage = file.mimeType.startsWith("image/");
  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": isImage
        ? `inline; filename="${safeName}"`
        : `attachment; filename="${safeName}"`,
      "Content-Length": String(file.buffer.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
