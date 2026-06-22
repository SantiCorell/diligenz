import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncDocumentToUserDrive } from "@/lib/google-drive/document-sync";
import {
  dniSideFromInput,
  removeDniFile,
  saveDniFile,
} from "@/lib/user-documents/dni";
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
  const sideInput = formData.get("side")?.toString() ?? "";
  const side = dniSideFromInput(sideInput);
  const file = formData.get("file");

  if (!side) {
    return NextResponse.json({ error: "Indica side=front o side=back." }, { status: 400 });
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  const bytes = Buffer.from(await file.arrayBuffer());

  let storage: { storagePath: string; size: number };
  try {
    storage = await saveDniFile({
      userId: session.userId,
      side,
      originalName: file.name,
      mimeType,
      bytes,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Archivo no válido.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const existing = await prisma.userDniDocument.findUnique({
    where: { userId_side: { userId: session.userId, side } },
  });
  if (existing) {
    await removeDniFile(existing.storagePath);
  }

  const kind = side === "FRONT" ? "dni-front" : "dni-back";
  let driveSyncedAt: Date | null = null;
  try {
    const synced = await syncDocumentToUserDrive({
      userId: session.userId,
      kind,
      originalFileName: file.name,
      mimeType,
      content: bytes,
    });
    if (synced) driveSyncedAt = new Date();
  } catch (e) {
    console.error("[user/dni] drive sync:", e);
  }

  await prisma.$transaction([
    prisma.userDniDocument.upsert({
      where: { userId_side: { userId: session.userId, side } },
      create: {
        userId: session.userId,
        side,
        name: file.name,
        storagePath: storage.storagePath,
        mimeType,
        size: storage.size,
        driveSyncedAt,
      },
      update: {
        name: file.name,
        storagePath: storage.storagePath,
        mimeType,
        size: storage.size,
        driveSyncedAt,
      },
    }),
    prisma.user.update({
      where: { id: session.userId },
      data: { dniVerified: false },
    }),
  ]);

  const docs = await prisma.userDniDocument.findMany({
    where: { userId: session.userId },
    select: { side: true },
  });
  const hasFront = docs.some((d) => d.side === "FRONT");
  const hasBack = docs.some((d) => d.side === "BACK");
  const verificationStatus = getDniVerificationStatus({
    dniVerified: false,
    hasFront,
    hasBack,
  });

  return NextResponse.json({
    ok: true,
    side: side === "FRONT" ? "front" : "back",
    syncedToDrive: Boolean(driveSyncedAt),
    verificationStatus,
    pendingReview: verificationStatus === "pending",
  });
}
