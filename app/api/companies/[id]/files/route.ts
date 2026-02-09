import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

type Params = { params: Promise<{ id: string }> };

async function canAccessCompanyFiles(companyId: string, userId: string): Promise<boolean> {
  const [company, user] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
  ]);
  if (!company || !user) return false;
  return company.ownerId === userId || user.role === "ADMIN";
}

/** Lista de archivos (solo admin o dueño de la empresa) */
export async function GET(_req: Request, { params }: Params) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId } = await params;
  if (!companyId) {
    return NextResponse.json({ error: "companyId requerido" }, { status: 400 });
  }

  const allowed = await canAccessCompanyFiles(companyId, session.value);
  if (!allowed) {
    return NextResponse.json({ error: "Solo el dueño de la empresa o un administrador pueden ver los documentos" }, { status: 403 });
  }

  const files = await prisma.companyFile.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, size: true, mimeType: true, createdAt: true },
  });

  return NextResponse.json({ files });
}

/** Subir archivo (solo admin o dueño) */
export async function POST(req: Request, { params }: Params) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: companyId } = await params;
  if (!companyId) {
    return NextResponse.json({ error: "companyId requerido" }, { status: 400 });
  }

  const allowed = await canAccessCompanyFiles(companyId, session.value);
  if (!allowed) {
    return NextResponse.json({ error: "Solo el dueño de la empresa o un administrador pueden subir documentos" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  const maxSize = 15 * 1024 * 1024; // 15 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "El archivo no puede superar 15 MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  const ext = path.extname(safeName) || "";
  const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const storageName = `${fileId}${ext}`;

  const baseDir = path.join(process.cwd(), "data", "company-files", companyId);
  await mkdir(baseDir, { recursive: true });
  const storagePath = path.join(companyId, storageName);
  const absolutePath = path.join(baseDir, storageName);

  const bytes = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(bytes));

  await prisma.companyFile.create({
    data: {
      companyId,
      uploadedById: session.value,
      name: file.name,
      storagePath,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    },
  });

  return NextResponse.json({ success: true, name: file.name });
}
