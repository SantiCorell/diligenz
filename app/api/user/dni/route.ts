import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriveAuthMode } from "@/lib/google-drive/auth";
import { dniSideFromInput } from "@/lib/user-documents/dni";
import { saveUserDni } from "@/lib/user-documents/save-user-dni";
import { getDniVerificationStatus } from "@/lib/user-documents/dni-status";
import { getSessionWithUserFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const docs = await prisma.userDniDocument.findMany({
    where: { userId: session.userId },
    select: { side: true, name: true, createdAt: true, driveSyncedAt: true },
  });

  const front = docs.find((d) => d.side === "FRONT") ?? null;
  const back = docs.find((d) => d.side === "BACK") ?? null;

  const hasFront = Boolean(front);
  const hasBack = Boolean(back);
  const verificationStatus = getDniVerificationStatus({
    dniVerified: session.user.dniVerified,
    hasFront,
    hasBack,
  });

  return NextResponse.json({
    dniVerified: session.user.dniVerified,
    verificationStatus,
    pendingReview: verificationStatus === "pending",
    front: front
      ? { uploaded: true, name: front.name, uploadedAt: front.createdAt, syncedToDrive: Boolean(front.driveSyncedAt) }
      : null,
    back: back
      ? { uploaded: true, name: back.name, uploadedAt: back.createdAt, syncedToDrive: Boolean(back.driveSyncedAt) }
      : null,
    driveFolderUrl: session.user.documentsDriveFolderUrl ?? null,
  });
}

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const side = dniSideFromInput(formData.get("side")?.toString() ?? "");
  const file = formData.get("file");
  if (!side) return NextResponse.json({ error: "Indica side=front o side=back." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });

  let result;
  try {
    result = await saveUserDni({
      userId: session.userId,
      role: session.user.role,
      personName: session.user.name?.trim() || session.user.email,
      email: session.user.email,
      side,
      file,
      clientServiceId: formData.get("clientServiceId")?.toString() || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Archivo no válido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if ("error" in result) {
    console.error("[user/dni] Drive falló:", {
      userId: session.userId,
      authMode: getDriveAuthMode(),
      driveError: result.error,
    });
    return NextResponse.json(
      { error: "No se pudo guardar el DNI en Drive. Inténtalo de nuevo en unos minutos.", code: result.error },
      {
        status: 503,
        headers: {
          "X-Drive-Error": result.error ?? "unknown",
          "X-Drive-Auth-Mode": getDriveAuthMode() ?? "none",
        },
      }
    );
  }

  return NextResponse.json(result);
}
