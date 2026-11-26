import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { recordUserPageDuration } from "@/lib/user-page-view";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

/**
 * Cierra el tiempo visible de una vista propia.
 * Por debajo de 2 s no se guarda. Por encima de 30 min se recorta.
 * Sin sesión, o si la fila no es de este usuario, no revela si el id existe.
 */
export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) {
    return new NextResponse(null, { status: 204, headers: noStore });
  }

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 2000) {
      return NextResponse.json({ error: "Solicitud no válida" }, { status: 400, headers: noStore });
    }
    body = raw ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400, headers: noStore });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400, headers: noStore });
  }

  const { id, durationMs } = body as { id?: unknown; durationMs?: unknown };
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs)) {
    return NextResponse.json({ error: "Solicitud no válida" }, { status: 400, headers: noStore });
  }

  try {
    const ok = await recordUserPageDuration(session.userId, id, durationMs);
    if (!ok) return new NextResponse(null, { status: 204, headers: noStore });
    return new NextResponse(null, { status: 204, headers: noStore });
  } catch {
    console.error("[user-pageview] no se pudo guardar la duración");
    return new NextResponse(null, { status: 503, headers: noStore });
  }
}
