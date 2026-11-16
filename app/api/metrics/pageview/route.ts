import { NextResponse } from "next/server";
import { recordAggregatePageView } from "@/lib/aggregate-page-metric";

export const dynamic = "force-dynamic";

/**
 * Suma 1 a un total agregado (ruta + día + tipo de navegación + cubo de carga).
 * No usa cookies ni guarda identificadores. No reenvía nada a GTM, Google ni Meta.
 * Hace falta la migración AggregatePageMetric (prisma migrate deploy).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 2000) {
      return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
    }
    body = raw ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  const { path, nav, perf } = body as {
    path?: unknown;
    nav?: unknown;
    perf?: unknown;
  };

  try {
    await recordAggregatePageView({ path, nav, perf });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid-path") {
      return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 });
    }
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code)
        : "unknown";
    console.error("AggregatePageMetric: no se pudo incrementar el total", code);
    return new NextResponse(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
