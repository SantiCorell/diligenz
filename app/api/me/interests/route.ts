import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
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
