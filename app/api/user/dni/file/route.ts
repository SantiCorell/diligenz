import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { dniAbsolutePath, dniSideFromInput } from "@/lib/user-documents/dni";
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

  let buffer: Buffer;
  try {
    buffer = await readFile(dniAbsolutePath(doc.storagePath));
  } catch {
    return NextResponse.json({ error: "Archivo no disponible." }, { status: 404 });
  }

  const safeName = doc.name.replace(/"/g, "%22");
  const isImage = (doc.mimeType ?? "").startsWith("image/");
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType ?? "application/octet-stream",
      "Content-Disposition": isImage
        ? `inline; filename="${safeName}"`
        : `attachment; filename="${safeName}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
