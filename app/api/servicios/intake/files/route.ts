import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { saveClientServiceFile } from "@/lib/client-service-files";
import { resolveIntakeTarget } from "@/lib/service-intake-access";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administración puede modificar los documentos del servicio." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const target = await resolveIntakeTarget(session, {
    clientServiceId: form?.get("clientServiceId"),
    contactRequestId: form?.get("contactRequestId"),
  });
  if ("error" in target) return NextResponse.json({ error: target.error }, { status: target.status });

  const slot = form?.get("slot");
  if (slot === "dni") {
    return NextResponse.json({ error: "El DNI se guarda en la carpeta de Drive del cliente." }, { status: 400 });
  }
  if (slot !== "capital") {
    return NextResponse.json({ error: "Indica qué documento estás subiendo." }, { status: 400 });
  }
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Adjunta un archivo." }, { status: 400 });

  const or = [
    target.clientServiceId ? { clientServiceId: target.clientServiceId } : null,
    target.contactRequestId ? { contactRequestId: target.contactRequestId } : null,
  ].filter((item): item is { clientServiceId: string } | { contactRequestId: string } => item !== null);
  const existing = await prisma.serviceIntake.findFirst({ where: { OR: or }, select: { id: true } });
  const intake = existing
    ? existing
    : await prisma.serviceIntake.create({
        data: {
          userId: target.userId,
          clientServiceId: target.clientServiceId,
          contactRequestId: target.contactRequestId,
        },
        select: { id: true },
      });

  try {
    const stored = await saveClientServiceFile(intake.id, file);
    const saved = await prisma.serviceIntakeFile.create({
      data: { intakeId: intake.id, slot, ...stored },
      select: { id: true, name: true, slot: true },
    });
    return NextResponse.json({ file: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el archivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
