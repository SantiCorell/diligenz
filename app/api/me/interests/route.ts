import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function GET() {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ interests: [] });
  }
  const interests = await prisma.userCompanyInterest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    interests: interests.map((i) => ({ companyId: i.companyId, type: i.type })),
  });
}
