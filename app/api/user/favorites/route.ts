import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/session";
import { getUserFavoriteCompanyIds } from "@/lib/company-favorites";

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const companyIds = await getUserFavoriteCompanyIds(userId);
  return NextResponse.json({ companyIds });
}
