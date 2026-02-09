import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.value },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const companyId = formData.get("companyId")?.toString();
  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const sellerDescription = formData.get("sellerDescription")?.toString();
  const documentLinksRaw = formData.get("documentLinks")?.toString();
  const gmv = formData.get("gmv")?.toString();
  const employeesRaw = formData.get("employees")?.toString();
  const attachmentsApproved = formData.get("attachmentsApproved") === "on";

  const documentLinks = parseDocumentLinks(documentLinksRaw ?? null);
  const employees =
    employeesRaw != null && employeesRaw.trim() !== ""
      ? parseInt(employeesRaw.trim(), 10)
      : null;
  const employeesValue =
    employees != null && !Number.isNaN(employees) && employees >= 0
      ? employees
      : null;

  await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(name != null && name !== "" && { name }),
      description: (description ?? "").trim() || null,
      sellerDescription: (sellerDescription ?? "").trim() || null,
      documentLinks: documentLinks ?? Prisma.JsonNull,
      gmv: (gmv ?? "").trim() || null,
      employees: employeesValue,
      attachmentsApproved,
    },
  });

  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/admin/companies/${companyId}?success=company_updated`, url.origin));
}
