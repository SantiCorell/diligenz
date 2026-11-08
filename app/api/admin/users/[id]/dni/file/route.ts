import { NextResponse } from "next/server";
import { dniSideFromInput } from "@/lib/user-documents/dni";
import { dniFileResponse, loadUserDniFile } from "@/lib/user-documents/load-dni-file";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** Solo un administrador autenticado puede ver el DNI de otro usuario. */
export async function GET(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const side = dniSideFromInput(new URL(req.url).searchParams.get("side") ?? "");
  if (!side) {
    return NextResponse.json({ error: "Parámetro side inválido." }, { status: 400 });
  }

  const file = await loadUserDniFile({ userId: id, side });
  if (!file) {
    return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
  }

  return dniFileResponse(file);
}
