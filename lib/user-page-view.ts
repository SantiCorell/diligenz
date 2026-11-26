import { prisma } from "@/lib/prisma";
import { normalizeMetricPath } from "@/lib/aggregate-page-metric";
import { clampPageDuration } from "@/lib/page-view-limits";

const DEDUPE_MS = 1_500;

/**
 * Abre una vista para un usuario con sesión.
 * Si acaba de registrarse la misma ruta, reutiliza esa fila (doble efecto en desarrollo).
 */
export async function startUserPageView(userId: string, rawPath: unknown): Promise<string> {
  const path = normalizeMetricPath(rawPath);
  if (!path) throw new Error("invalid-path");

  const since = new Date(Date.now() - DEDUPE_MS);
  const recent = await prisma.userPageView.findFirst({
    where: { userId, path, startedAt: { gte: since } },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (recent) return recent.id;

  const created = await prisma.userPageView.create({
    data: { userId, path },
    select: { id: true },
  });
  return created.id;
}

/**
 * Guarda la duración visible. Ignora el ruido corto y no baja un valor ya mayor.
 * Devuelve false si la fila no es de este usuario.
 */
export async function recordUserPageDuration(
  userId: string,
  id: unknown,
  durationMs: unknown
): Promise<boolean> {
  if (typeof id !== "string" || !/^c[a-z0-9]{8,32}$/.test(id)) return false;
  if (typeof durationMs !== "number") return false;

  const next = clampPageDuration(durationMs);
  if (next == null) return true;

  const updated = await prisma.userPageView.updateMany({
    where: {
      id,
      userId,
      OR: [{ durationMs: null }, { durationMs: { lt: next } }],
    },
    data: { durationMs: next },
  });

  if (updated.count > 0) return true;

  const owns = await prisma.userPageView.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  return owns != null;
}
