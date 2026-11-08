import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

const intakeFiles = {
  orderBy: { createdAt: "desc" as const },
  select: { id: true, name: true, slot: true },
};

const intakeSelect = {
  clientServiceId: true,
  contactRequestId: true,
  companyName: true,
  shareholders: true,
  shareCapital: true,
  registeredOffice: true,
  managementRegime: true,
  proposedNames: true,
  constitutionDetails: true,
  digitalSignature: true,
  bankOffice: true,
  files: intakeFiles,
};

const serviceInclude = {
  user: { select: { id: true, name: true, email: true } },
  steps: { orderBy: { position: "asc" as const } },
  documents: { orderBy: { createdAt: "desc" as const }, select: { id: true, name: true, size: true, createdAt: true } },
  serviceIntake: { include: { files: intakeFiles } },
} satisfies Prisma.ClientServiceInclude;

function cleanSteps(raw: unknown) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 20) return null;
  const steps = raw
    .map((step) => {
      if (!step || typeof step !== "object") return null;
      const title = "title" in step && typeof step.title === "string" ? step.title.trim().slice(0, 120) : "";
      const detail = "detail" in step && typeof step.detail === "string" ? step.detail.trim().slice(0, 500) : "";
      if (title.length < 2) return null;
      return { title, detail: detail || null };
    })
    .filter((step): step is { title: string; detail: string | null } => step !== null);
  return steps.length === raw.length ? steps : null;
}

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [requests, services] = await Promise.all([
    prisma.contactRequest.findMany({
      where: { source: "servicios", clientService: null },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        createdAt: true,
        userId: true,
        user: { select: { id: true, name: true, email: true } },
        serviceIntake: { select: intakeSelect },
      },
    }),
    prisma.clientService.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: serviceInclude,
    }),
  ]);

  return NextResponse.json({ requests, services });
}

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const summary = typeof body.summary === "string" ? body.summary.trim().slice(0, 4000) : "";
  const priceEur = body.priceEur;
  const steps = cleanSteps(body.steps);
  const contactRequestId = typeof body.contactRequestId === "string" && body.contactRequestId ? body.contactRequestId : null;

  if (!userId || title.length < 2) {
    return NextResponse.json({ error: "Indica el cliente y el nombre del servicio." }, { status: 400 });
  }
  if (typeof priceEur !== "number" || !Number.isInteger(priceEur) || priceEur < 0 || priceEur > 1_000_000) {
    return NextResponse.json({ error: "El precio tiene que ser un importe en euros, sin IVA." }, { status: 400 });
  }
  if (!steps) {
    return NextResponse.json({ error: "Añade entre 1 y 20 pasos, cada uno con un título." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true, email: true } });
  if (!user) return NextResponse.json({ error: "El cliente no existe." }, { status: 404 });

  if (contactRequestId) {
    const request = await prisma.contactRequest.findUnique({
      where: { id: contactRequestId },
      select: { id: true, source: true, userId: true, email: true, clientService: { select: { id: true } } },
    });
    if (!request || request.source !== "servicios" || request.clientService) {
      return NextResponse.json({ error: "Esa solicitud ya no se puede convertir en propuesta." }, { status: 400 });
    }
    const sameAccount = request.userId === user.id || request.email.trim().toLowerCase() === user.email.toLowerCase();
    if (!sameAccount) {
      return NextResponse.json({ error: "La solicitud no corresponde a ese cliente." }, { status: 400 });
    }
    if (!request.userId) {
      await prisma.contactRequest.update({ where: { id: request.id }, data: { userId: user.id } });
    }
  }

  const service = await prisma.clientService.create({
    data: {
      userId: user.id,
      contactRequestId,
      title,
      summary: summary || null,
      priceEur,
      steps: { create: steps.map((step, position) => ({ ...step, position })) },
    },
    include: serviceInclude,
  });

  if (contactRequestId) {
    await prisma.serviceIntake.updateMany({
      where: { contactRequestId, clientServiceId: null },
      data: { clientServiceId: service.id },
    });
  }

  return NextResponse.json({ service });
}
