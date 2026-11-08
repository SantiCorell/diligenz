import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDriveLink } from "@/lib/drive-link";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.clientService.findUnique({
    where: { id },
    select: { id: true, status: true, acceptedAt: true },
  });
  if (!existing) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: {
    title?: string;
    summary?: string | null;
    priceEur?: number;
    status?: "PROPOSAL" | "IN_PROGRESS" | "COMPLETED" | "DISCARDED";
    documentsUrl?: string | null;
    invoicesUrl?: string | null;
  } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim().slice(0, 160);
    if (title.length < 2) return NextResponse.json({ error: "El nombre del servicio es demasiado corto." }, { status: 400 });
    data.title = title;
  }
  if (typeof body.summary === "string") data.summary = body.summary.trim().slice(0, 4000) || null;
  if (body.priceEur !== undefined) {
    if (typeof body.priceEur !== "number" || !Number.isInteger(body.priceEur) || body.priceEur < 0 || body.priceEur > 1_000_000) {
      return NextResponse.json({ error: "El precio tiene que ser un importe en euros, sin IVA." }, { status: 400 });
    }
    data.priceEur = body.priceEur;
  }
  if (body.status === "COMPLETED" || body.status === "DISCARDED") {
    data.status = body.status;
  } else if (body.status === "IN_PROGRESS" || body.status === "PROPOSAL") {
    const closed = existing.status === "COMPLETED" || existing.status === "DISCARDED";
    const back = existing.acceptedAt ? "IN_PROGRESS" : "PROPOSAL";
    if (!closed || body.status !== back) {
      return NextResponse.json({ error: "Ese cambio de estado no está permitido." }, { status: 400 });
    }
    data.status = body.status;
  } else if (body.status !== undefined) {
    return NextResponse.json({ error: "Ese cambio de estado no está permitido." }, { status: 400 });
  }
  for (const key of ["documentsUrl", "invoicesUrl"] as const) {
    if (body[key] === undefined) continue;
    const parsed = parseDriveLink(body[key]);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    data[key] = parsed.url;
  }

  let steps: { id: string | null; title: string; detail: string | null; done: boolean }[] | null = null;
  if (body.steps !== undefined) {
    if (!Array.isArray(body.steps) || body.steps.length < 1 || body.steps.length > 20) {
      return NextResponse.json({ error: "Añade entre 1 y 20 pasos." }, { status: 400 });
    }
    steps = [];
    for (const step of body.steps) {
      if (!step || typeof step !== "object" || typeof step.title !== "string" || step.title.trim().length < 2) {
        return NextResponse.json({ error: "Cada paso necesita un título." }, { status: 400 });
      }
      steps.push({
        id: typeof step.id === "string" && step.id ? step.id : null,
        title: step.title.trim().slice(0, 120),
        detail: typeof step.detail === "string" && step.detail.trim() ? step.detail.trim().slice(0, 500) : null,
        done: step.done === true,
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length) {
      await tx.clientService.update({ where: { id }, data });
    }
    if (steps) {
      const current = await tx.clientServiceStep.findMany({ where: { serviceId: id }, select: { id: true } });
      const known = new Set(current.map((step) => step.id));
      const kept: string[] = [];
      for (const [position, step] of steps.entries()) {
        if (step.id && known.has(step.id)) {
          await tx.clientServiceStep.update({
            where: { id: step.id },
            data: { position, title: step.title, detail: step.detail, done: step.done },
          });
          kept.push(step.id);
        } else {
          const created = await tx.clientServiceStep.create({
            data: { serviceId: id, position, title: step.title, detail: step.detail, done: step.done },
            select: { id: true },
          });
          kept.push(created.id);
        }
      }
      await tx.clientServiceStep.deleteMany({ where: { serviceId: id, id: { notIn: kept } } });
    }
  });

  const service = await prisma.clientService.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      steps: { orderBy: { position: "asc" } },
      documents: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, size: true, createdAt: true } },
      serviceIntake: {
        include: { files: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, slot: true } } },
      },
    },
  });
  return NextResponse.json({ service });
}
