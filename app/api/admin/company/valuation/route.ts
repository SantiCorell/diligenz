import { NextResponse } from "next/server";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { parseValuationFormData, upsertCompanyValuation } from "@/lib/update-company-valuation";
import { isCompanyRemoved } from "@/lib/is-company-removed";

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  const origin = new URL(req.url).origin;
  if (!companyId) {
    return NextResponse.redirect(new URL("/admin/companies?error=valuation", origin));
  }

  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=company_removed`, origin)
    );
  }

  const parsed = parseValuationFormData(formData);
  if ("error" in parsed) {
    return NextResponse.redirect(new URL(`/admin/companies/${companyId}?error=valuation`, origin));
  }

  await upsertCompanyValuation(companyId, parsed);

  return NextResponse.redirect(new URL(`/admin/companies/${companyId}?success=valuation`, origin));
}
