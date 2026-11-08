import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { readClientServiceFile } from "@/lib/client-service-files";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const document = await prisma.clientServiceDocument.findUnique({
    where: { id },
    include: { service: { select: { userId: true } } },
  });
  if (!document) return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  if (session.user.role !== "ADMIN" && document.service.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const bytes = await readClientServiceFile(document.storagePath);
  const filename = document.name.replace(/["\r\n]/g, "");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": document.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
