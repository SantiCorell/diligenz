import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriveAuthMode } from "@/lib/google-drive/auth";
import { dniSideFromInput } from "@/lib/user-documents/dni";
import { getDniVerificationStatus } from "@/lib/user-documents/dni-status";
import { saveUserDni } from "@/lib/user-documents/save-user-dni";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: Request, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, dniVerified: true, documentsDriveFolderUrl: true },
  });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const docs = await prisma.userDniDocument.findMany({
    where: { userId: id },
    select: { side: true, name: true, createdAt: true, driveSyncedAt: true },
  });
  const front = docs.find((doc) => doc.side === "FRONT") ?? null;
  const back = docs.find((doc) => doc.side === "BACK") ?? null;
  return NextResponse.json({
    dniVerified: user.dniVerified,
    verificationStatus: getDniVerificationStatus({
      dniVerified: user.dniVerified,
      hasFront: Boolean(front),
      hasBack: Boolean(back),
    }),
    front: front ? { uploaded: true, name: front.name, uploadedAt: front.createdAt, syncedToDrive: Boolean(front.driveSyncedAt) } : null,
    back: back ? { uploaded: true, name: back.name, uploadedAt: back.createdAt, syncedToDrive: Boolean(back.driveSyncedAt) } : null,
    driveFolderUrl: user.documentsDriveFolderUrl,
  });
}

export async function POST(req: Request, { params }: Params) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const formData = await req.formData();
  const side = dniSideFromInput(formData.get("side")?.toString() ?? "");
  const file = formData.get("file");
  if (!side) return NextResponse.json({ error: "Indica side=front o side=back." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });

  let result;
  try {
    result = await saveUserDni({
      userId: user.id,
      role: user.role,
      personName: user.name?.trim() || user.email,
      email: user.email,
      side,
      file,
      clientServiceId: formData.get("clientServiceId")?.toString() || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Archivo no válido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if ("error" in result) {
    return NextResponse.json(
      { error: "No se pudo guardar el DNI en Drive. Inténtalo de nuevo en unos minutos.", code: result.error },
      { status: 503, headers: { "X-Drive-Error": result.error ?? "unknown", "X-Drive-Auth-Mode": getDriveAuthMode() ?? "none" } }
    );
  }
  return NextResponse.json(result);
}
