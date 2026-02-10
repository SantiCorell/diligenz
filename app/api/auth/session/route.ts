import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ loggedIn: false });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });
  return NextResponse.json({
    loggedIn: true,
    role: user?.role ?? null,
  });
}
