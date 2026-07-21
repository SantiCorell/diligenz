import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionWithUserFromRequest } from "@/lib/session";
import { buildUnregisteredContactGroups } from "@/lib/unregistered-contacts";

export async function GET(req: Request) {
  const session = await getSessionWithUserFromRequest(req);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [users, valuations, contacts] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: { email: true },
    }),
    prisma.valuationLead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  let groups = buildUnregisteredContactGroups(
    users.map((u) => u.email),
    valuations,
    contacts
  );

  if (q) {
    groups = groups.filter(
      (g) =>
        g.email.includes(q) ||
        (g.displayName?.toLowerCase().includes(q) ?? false) ||
        (g.phone?.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ?? false)
    );
  }

  return NextResponse.json({
    contacts: groups.map((g) => ({
      ...g,
      latestActivity: g.latestActivity.toISOString(),
      valuations: g.valuations.map((v) => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
      contactRequests: g.contactRequests.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    })),
    total: groups.length,
  });
}
