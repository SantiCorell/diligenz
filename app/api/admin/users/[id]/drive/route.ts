import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGoogleDriveConfigured } from "@/lib/google-drive/auth";
import { provisionUserDriveFolder } from "@/lib/google-drive/user-drive";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** Crea la carpeta de Drive del usuario si todavía no existe. */
export async function POST(_req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(_req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isGoogleDriveConfigured()) {
    return NextResponse.json(
      { error: "Google Drive no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const folderId = await provisionUserDriveFolder(user);
  if (!folderId) {
    return NextResponse.json(
      { error: "No se ha podido crear la carpeta de Drive." },
      { status: 502 }
    );
  }

  const updated = await prisma.user.findUnique({
    where: { id },
    select: { documentsDriveFolderUrl: true },
  });

  return NextResponse.json({
    ok: true,
    documentsDriveFolderUrl: updated?.documentsDriveFolderUrl ?? null,
  });
}
