import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest } from "@/lib/session";

/** La app ya no crea carpetas de Drive. El enlace se guarda con PATCH del usuario. */
export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(
    {
      error:
        "La app ya no crea carpetas de Drive. Crea la carpeta en Google Drive y pega el enlace en la ficha del usuario.",
    },
    { status: 410 }
  );
}
