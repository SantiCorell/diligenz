import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { saveClientServiceFile } from "@/lib/client-service-files";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const service = await prisma.clientService.findUnique({ where: { id }, select: { id: true } });
  if (!service) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjunta un archivo." }, { status: 400 });
  }

  try {
    const stored = await saveClientServiceFile(id, file);
    const document = await prisma.clientServiceDocument.create({
      data: { serviceId: id, ...stored },
      select: { id: true, name: true, size: true, createdAt: true },
    });
    return NextResponse.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el archivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
