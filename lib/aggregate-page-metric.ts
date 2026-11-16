import { prisma } from "@/lib/prisma";

/**
 * Contador agregado de vistas de página.
 * Persistencia: tabla AggregatePageMetric (Prisma / PostgreSQL).
 * Cada aviso hace +1 en la fila (ruta, día UTC, tipo de navegación, cubo de carga).
 * No lee ni guarda cookie, IP, user-agent, referrer ni ningún id de persona o sesión.
 * Estos totales no se envían a dataLayer, GTM, Google Analytics ni Meta.
 */

const NAV = new Set([
  "navigate",
  "reload",
  "back_forward",
  "prerender",
  "spa",
  "unknown",
]);

const PERF = new Set(["fast", "ok", "slow", "unknown"]);

const PATH_RE = /^\/[\p{L}\p{N}/_\-.~%]*$/u;

export function normalizeMetricPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return null;
  if (
    trimmed.includes("?") ||
    trimmed.includes("#") ||
    trimmed.includes("\\") ||
    trimmed.includes("://") ||
    trimmed.includes("..") ||
    trimmed.includes("//") ||
    trimmed.includes("@")
  ) {
    return null;
  }
  let path = trimmed;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.length > 180) return null;
  if (!PATH_RE.test(path)) return null;
  return path;
}

function bucket(value: unknown, allowed: Set<string>): string {
  return typeof value === "string" && allowed.has(value) ? value : "unknown";
}

function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function recordAggregatePageView(input: {
  path: unknown;
  nav: unknown;
  perf: unknown;
}): Promise<void> {
  const path = normalizeMetricPath(input.path);
  if (!path) {
    throw new Error("invalid-path");
  }

  const nav = bucket(input.nav, NAV);
  const perf = bucket(input.perf, PERF);
  const day = utcDay();
  const where = { path_day_nav_perf: { path, day, nav, perf } };

  try {
    await prisma.aggregatePageMetric.upsert({
      where,
      create: { path, day, nav, perf, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch (error) {
    if (!isUniqueConflict(error)) throw error;
    await prisma.aggregatePageMetric.update({
      where,
      data: { count: { increment: 1 } },
    });
  }
}
