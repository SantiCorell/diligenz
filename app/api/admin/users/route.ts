import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, type UserAccountStatus, type UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getSessionWithUserFromRequest } from "@/lib/session";

const ROLES: UserRole[] = ["ADMIN", "BUYER", "SELLER", "PROFESSIONAL"];
const STATUSES: UserAccountStatus[] = ["PENDING", "IN_REVIEW", "ACTIVE", "REJECTED"];

function jsonDocumentLinksMeaningful(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

async function ownerIdsWithCompanyDocumentLinks(): Promise<string[]> {
  const rows = await prisma.company.findMany({
    where: { documentLinks: { not: Prisma.DbNull } },
    select: { ownerId: true, documentLinks: true },
  });
  const ids = new Set<string>();
  for (const r of rows) {
    if (jsonDocumentLinksMeaningful(r.documentLinks)) ids.add(r.ownerId);
  }
  return [...ids];
}

/**
 * GET: listar usuarios con filtros (query). POST: crear usuario.
 */
export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const roleParam = searchParams.get("role") ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const emailVerified = searchParams.get("emailVerified") === "1";
  const dniVerified = searchParams.get("dniVerified") === "1";
  const ndaSigned = searchParams.get("ndaSigned") === "1";
  const documentLinks = searchParams.get("documentLinks") === "1";

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }

  if (roleParam && ROLES.includes(roleParam as UserRole)) {
    where.role = roleParam as UserRole;
  }

  if (statusParam && STATUSES.includes(statusParam as UserAccountStatus)) {
    where.accountStatus = statusParam as UserAccountStatus;
  }

  if (emailVerified) where.emailVerified = true;
  if (dniVerified) where.dniVerified = true;
  if (ndaSigned) where.ndaSigned = true;

  if (documentLinks) {
    const companyIds = await ownerIdsWithCompanyDocumentLinks();
    const withDriveFolder = await prisma.user.findMany({
      where: {
        deletedAt: null,
        documentsDriveFolderUrl: { not: null },
      },
      select: { id: true },
    });
    const merged = new Set([...companyIds, ...withDriveFolder.map((r) => r.id)]);
    where.id = { in: merged.size ? [...merged] : ["__none__"] };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      emailVerified: true,
      ndaSigned: true,
      dniVerified: true,
      profileVerifiedByAdmin: true,
      documentsDriveFolderUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const docLinkOwners = new Set(await ownerIdsWithCompanyDocumentLinks());
  const payload = users.map((u) => ({
    ...u,
    hasCompanyDocumentLinks: docLinkOwners.has(u.id),
    hasUserDriveFolder: Boolean(u.documentsDriveFolderUrl?.trim()),
  }));

  return NextResponse.json({ users: payload });
}

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo un administrador puede crear usuarios." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { email, password, role = "ADMIN", phone, name: nameRaw } = body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "El email es obligatorio." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const validRole = ROLES.includes(role as UserRole) ? (role as UserRole) : "ADMIN";
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const nameTrim =
    typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim().slice(0, 200) : null;

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: validRole,
      phone: phone && typeof phone === "string" ? phone.trim() || null : null,
      name: nameTrim,
      accountStatus: "ACTIVE",
    },
    select: { id: true, email: true, role: true, createdAt: true, name: true, accountStatus: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
