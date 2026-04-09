import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { isCompanyRemoved } from "@/lib/is-company-removed";

function parseDocumentLinks(raw: string | null): { label: string; url: string }[] | null {
  if (!raw || !raw.trim()) return null;
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  const links: { label: string; url: string }[] = [];
  for (const line of lines) {
    const pipe = line.indexOf("|");
    if (pipe === -1) continue;
    const label = line.slice(0, pipe).trim();
    const url = line.slice(pipe + 1).trim();
    if (label && url) links.push({ label, url });
  }
  return links.length ? links : null;
}

const COMPANY_TYPES = ["EMPRESA", "AUTONOMO", "STARTUP", "MARKETPLACE"] as const;

export async function POST(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const url = new URL(req.url);
  if (await isCompanyRemoved(companyId)) {
    return NextResponse.redirect(
      new URL(`/admin/companies/${companyId}?error=company_removed`, url.origin)
    );
  }

  const name = formData.get("name")?.toString();
  const sector = formData.get("sector")?.toString()?.trim();
  const location = formData.get("location")?.toString()?.trim();
  const revenue = formData.get("revenue")?.toString()?.trim();
  const ebitdaRaw = formData.get("ebitda")?.toString();
  const exerciseResultRaw = formData.get("exerciseResult")?.toString();
  const description = formData.get("description")?.toString();
  const sellerDescription = formData.get("sellerDescription")?.toString();
  const documentLinksRaw = formData.get("documentLinks")?.toString();
  const employeesRaw = formData.get("employees")?.toString();
  const attachmentsApproved = formData.get("attachmentsApproved") === "on";
  const companyTypeRaw = formData.get("companyType")?.toString();
  const yearsOperatingRaw = formData.get("yearsOperating")?.toString();
  const revenueGrowthPercentRaw = formData.get("revenueGrowthPercent")?.toString();
  const stageRaw = formData.get("stage")?.toString();
  const takeRatePercentRaw = formData.get("takeRatePercent")?.toString();
  const arrRaw = formData.get("arr")?.toString();
  const hasReceivedFundingRaw = formData.get("hasReceivedFunding")?.toString();
  const websiteRaw = formData.get("website")?.toString();
  const ownerIdRaw = formData.get("ownerId")?.toString()?.trim();
  const breakevenExpectedYearRaw = formData.get("breakevenExpectedYear")?.toString();

  const documentLinks = parseDocumentLinks(documentLinksRaw ?? null);
  const employees =
    employeesRaw != null && employeesRaw.trim() !== ""
      ? parseInt(employeesRaw.trim(), 10)
      : null;
  const employeesValue =
    employees != null && !Number.isNaN(employees) && employees >= 0
      ? employees
      : null;
  const companyTypeTrim = (companyTypeRaw ?? "").trim();
  const companyTypeValue = COMPANY_TYPES.includes(companyTypeTrim as (typeof COMPANY_TYPES)[number])
    ? companyTypeTrim
    : null;
  const yearsOperatingValue =
    yearsOperatingRaw != null && yearsOperatingRaw.trim() !== ""
      ? (() => {
          const n = parseInt(yearsOperatingRaw.trim(), 10);
          return !Number.isNaN(n) && n >= 0 ? n : null;
        })()
      : null;
  const revenueGrowthPercentValue =
    revenueGrowthPercentRaw != null && revenueGrowthPercentRaw.trim() !== ""
      ? (() => {
          const n = parseFloat(revenueGrowthPercentRaw.trim());
          return !Number.isNaN(n) ? n : null;
        })()
      : null;
  const stageValue = (stageRaw ?? "").trim() || null;
  const takeRatePercentValue =
    takeRatePercentRaw != null && takeRatePercentRaw.trim() !== ""
      ? (() => {
          const n = parseFloat(takeRatePercentRaw.trim());
          return !Number.isNaN(n) && n >= 0 ? n : null;
        })()
      : null;
  const arrValue =
    arrRaw != null && arrRaw.trim() !== ""
      ? (() => {
          const n = parseInt(arrRaw.trim(), 10);
          return !Number.isNaN(n) && n >= 0 ? n : null;
        })()
      : null;
  const hasReceivedFundingValue =
    hasReceivedFundingRaw !== undefined
      ? hasReceivedFundingRaw === "on" || hasReceivedFundingRaw === "true"
      : undefined;

  const breakevenExpectedYearValue =
    breakevenExpectedYearRaw != null && breakevenExpectedYearRaw.trim() !== ""
      ? (() => {
          const n = parseInt(breakevenExpectedYearRaw.trim(), 10);
          return !Number.isNaN(n) ? n : null;
        })()
      : null;

  let ownerIdUpdate: { ownerId: string } | Record<string, never> = {};
  if (ownerIdRaw) {
    const owner = await prisma.user.findUnique({ where: { id: ownerIdRaw } });
    if (owner && !owner.blocked) {
      ownerIdUpdate = { ownerId: ownerIdRaw };
    }
  }

  const ebitdaTrim = (ebitdaRaw ?? "").trim();
  const ebitdaValue = ebitdaTrim === "" ? null : ebitdaTrim;
  const exerciseResultTrim = (exerciseResultRaw ?? "").trim();
  const exerciseResultValue = exerciseResultTrim === "" ? null : exerciseResultTrim;

  await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(name != null && name !== "" && { name }),
      ...(sector != null && sector !== "" && { sector }),
      ...(location != null && location !== "" && { location }),
      ...(revenue != null && revenue !== "" && { revenue, gmv: null }),
      ebitda: ebitdaValue,
      exerciseResult: exerciseResultValue,
      description: (description ?? "").trim() || null,
      sellerDescription: (sellerDescription ?? "").trim() || null,
      documentLinks: documentLinks ?? Prisma.JsonNull,
      employees: employeesValue,
      attachmentsApproved,
      companyType: companyTypeValue,
      yearsOperating: yearsOperatingValue,
      revenueGrowthPercent: revenueGrowthPercentValue,
      stage: stageValue,
      takeRatePercent: takeRatePercentValue,
      arr: arrValue,
      breakevenExpectedYear: breakevenExpectedYearValue,
      ...(hasReceivedFundingValue !== undefined && { hasReceivedFunding: hasReceivedFundingValue }),
      website: (websiteRaw ?? "").trim() || null,
      ...ownerIdUpdate,
    },
  });

  return NextResponse.redirect(new URL(`/admin/companies/${companyId}?success=company_updated`, url.origin));
}
