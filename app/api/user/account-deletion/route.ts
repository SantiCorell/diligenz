import { NextResponse } from "next/server";
import { requestOwnAccountDeletion } from "@/lib/account-deletion";
import { getSessionWithUserFromRequest } from "@/lib/session";

/** El usuario autenticado solicita la baja de su propia cuenta. No la elimina. */
export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.deletedAt != null || session.user.accountStatus === "REJECTED") {
    return NextResponse.json({ error: "Cuenta no disponible" }, { status: 403 });
  }

  try {
    const result = await requestOwnAccountDeletion(session.userId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    }
    return NextResponse.json({ ok: true, alreadyPending: result.alreadyPending });
  } catch (err) {
    console.error("[account-deletion] request", err);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud." },
      { status: 500 }
    );
  }
}
