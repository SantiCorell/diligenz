import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) {
    return NextResponse.json({ interests: [] });
  }
  const interests = await prisma.userCompanyInterest.findMany({
    where: { userId: session.value },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    interests: interests.map((i) => ({ companyId: i.companyId, type: i.type })),
  });
}
