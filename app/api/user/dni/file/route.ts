import { NextResponse } from "next/server";
import { dniSideFromInput } from "@/lib/user-documents/dni";
import { dniFileResponse, loadUserDniFile } from "@/lib/user-documents/load-dni-file";
import { getSessionWithUserFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sideParam = new URL(req.url).searchParams.get("side") ?? "";
  const side = dniSideFromInput(sideParam);
  if (!side) {
    return NextResponse.json({ error: "Parámetro side inválido." }, { status: 400 });
  }

  const file = await loadUserDniFile({ userId: session.userId, side });
  if (!file) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

  return dniFileResponse(file);
}
