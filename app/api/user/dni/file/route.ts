import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { downloadUserDniFromDrive } from "@/lib/google-drive/user-drive";
import {
  dniAbsolutePath,
  dniSideFromInput,
  isCloudOnlyDniPath,
} from "@/lib/user-documents/dni";
import { getSessionWithUserFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sideParam = new URL(req.url).searchParams.get("side") ?? "";
  const side = dniSideFromInput(sideParam);
  if (!side) {
    return NextResponse.json({ error: "Parámetro side inválido." }, { status: 400 });
  }

  const doc = await prisma.userDniDocument.findUnique({
    where: { userId_side: { userId: session.userId, side } },
  });
  if (!doc) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

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
      userId: session.userId,
      side,
      originalFileName: doc.name,
    });
    if (!fromDrive) {
      return NextResponse.json({ error: "Archivo no disponible." }, { status: 404 });
    }
    buffer = fromDrive.buffer;
    mimeType = fromDrive.mimeType;
    fileName = fromDrive.name;
  }

  const safeName = fileName.replace(/"/g, "%22");
  const isImage = mimeType.startsWith("image/");
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": isImage
        ? `inline; filename="${safeName}"`
        : `attachment; filename="${safeName}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
