import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    select: { photoData: true, photoMime: true },
  });
  if (!agent?.photoData || !agent.photoMime) {
    return NextResponse.json({ error: "Sin foto" }, { status: 404 });
  }

  const bytes = new Uint8Array(agent.photoData);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": agent.photoMime,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
