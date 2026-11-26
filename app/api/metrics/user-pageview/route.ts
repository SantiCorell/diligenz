import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { startUserPageView } from "@/lib/user-page-view";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

/**
 * Abre una vista de página para el usuario de la sesión.
 * Sin sesión no guarda nada (204). No reenvía el evento a Google.
 * El aviso agregado anónimo sigue en /api/metrics/pageview y no espera consentimiento;
 * esta ruta tampoco, porque solo existe con la cookie de sesión, que es necesaria.
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

  const path =
    body && typeof body === "object" && "path" in body
      ? (body as { path?: unknown }).path
      : undefined;

  try {
    const id = await startUserPageView(session.userId, path);
    return NextResponse.json({ id }, { headers: noStore });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid-path") {
      return NextResponse.json({ error: "Solicitud no válida" }, { status: 400, headers: noStore });
    }
    console.error("[user-pageview] no se pudo abrir la vista");
    return new NextResponse(null, { status: 503, headers: noStore });
  }
}
