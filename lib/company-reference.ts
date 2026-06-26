import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const COMPANY_REFERENCE_PREFIX = "DIL-";
/** La primera referencia automática será DIL-1001 */
export const COMPANY_REFERENCE_SEQUENCE_START = 1000;

/** Normaliza referencia pública (mayúsculas, sin espacios extra). */
export function normalizeCompanyReference(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "-");
}

export function parseCompanyReferenceInput(
  raw: string | null | undefined
): string | null {
  if (!raw?.trim()) return null;
  const normalized = normalizeCompanyReference(raw);
  return normalized.length > 0 ? normalized.slice(0, 32) : null;
}

export function parseReferenceSequence(reference: string | null | undefined): number | null {
  if (!reference?.trim()) return null;
  const match = normalizeCompanyReference(reference).match(/^DIL-(\d+)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

export function formatCompanyReference(sequence: number): string {
  return `${COMPANY_REFERENCE_PREFIX}${String(sequence).padStart(4, "0")}`;
}

function isReferenceUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    Array.isArray(err.meta?.target) &&
    (err.meta.target as string[]).includes("reference")
  );
}

/** Siguiente número de secuencia según referencias DIL-#### existentes. */
export async function nextCompanyReferenceSequence(): Promise<number> {
  const rows = await prisma.company.findMany({
    where: { reference: { not: null } },
    select: { reference: true },
  });

  let max = COMPANY_REFERENCE_SEQUENCE_START;
  for (const row of rows) {
    const seq = parseReferenceSequence(row.reference);
    if (seq != null) max = Math.max(max, seq);
  }
  return max + 1;
}

/** Calcula la siguiente referencia libre (formato DIL-1001, DIL-1002…). */
export async function allocateNextCompanyReference(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const ref = formatCompanyReference(await nextCompanyReferenceSequence());
    const taken = await prisma.company.findFirst({
      where: { reference: ref },
      select: { id: true },
    });
    if (!taken) return ref;
  }
  throw new Error("No se pudo asignar una referencia única");
}

/**
 * Referencia para alta: manual si el admin la indica; si no, automática.
 */
export async function resolveReferenceForNewCompany(
  manualRaw?: string | null
): Promise<string> {
  const manual = parseCompanyReferenceInput(manualRaw);
  if (manual) return manual;
  return allocateNextCompanyReference();
}

/**
 * Asigna referencia a una empresa que aún no la tiene. Idempotente si ya tiene.
 */
export async function ensureCompanyReference(companyId: string): Promise<string> {
  try {
    const current = await prisma.company.findUnique({
      where: { id: companyId },
      select: { reference: true },
    });
    if (!current) throw new Error("Empresa no encontrada");
    if (current.reference) return current.reference;

    for (let attempt = 0; attempt < 20; attempt++) {
      const ref = await allocateNextCompanyReference();
      try {
        const updated = await prisma.company.updateMany({
          where: { id: companyId, reference: null },
          data: { reference: ref },
        });
        if (updated.count === 1) return ref;

        const again = await prisma.company.findUnique({
          where: { id: companyId },
          select: { reference: true },
        });
        if (again?.reference) return again.reference;
      } catch (err) {
        if (isReferenceUniqueViolation(err)) continue;
        throw err;
      }
    }

    throw new Error("No se pudo asignar referencia a la empresa");
  } catch (err) {
    if (isMissingReferenceField(err)) {
      console.warn(
        "[company-reference] Campo reference no disponible; ejecuta: npm run db:push:local && reinicia npm run dev"
      );
      return "—";
    }
    throw err;
  }
}

/**
 * Rellena referencias faltantes en empresas existentes (orden por antigüedad).
 */
export async function backfillMissingCompanyReferences(): Promise<number> {
  const pending = await prisma.company.findMany({
    where: { reference: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  let assigned = 0;
  for (const { id } of pending) {
    await ensureCompanyReference(id);
    assigned++;
  }
  return assigned;
}

function isCompanyReferenceSupported(): boolean {
  return "reference" in Prisma.CompanyScalarFieldEnum;
}

function isMissingReferenceField(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Unknown argument `reference`") ||
    msg.includes('column "reference"') ||
    msg.includes("column reference")
  );
}

export function companyReferenceFieldSupported(): boolean {
  return isCompanyReferenceSupported();
}

/** Solo ejecuta el backfill si quedan empresas sin referencia. */
export async function backfillMissingCompanyReferencesIfNeeded(): Promise<number> {
  if (!isCompanyReferenceSupported()) {
    console.warn(
      "[company-reference] Prisma Client sin campo reference; ejecuta: npm run db:push:local && reinicia npm run dev"
    );
    return 0;
  }
  try {
    const missing = await prisma.company.count({ where: { reference: null } });
    if (missing === 0) return 0;
    return backfillMissingCompanyReferences();
  } catch (err) {
    if (isMissingReferenceField(err)) {
      console.warn(
        "[company-reference] Campo reference no disponible; ejecuta: npm run db:push:local && reinicia npm run dev"
      );
      return 0;
    }
    throw err;
  }
}
