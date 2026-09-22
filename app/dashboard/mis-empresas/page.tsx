import Link from "next/link";
import { redirect } from "next/navigation";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveCompanyForBuyerInterest } from "@/lib/buyer-company-resolve";
import {
  getMaxConcurrentInfoRequests,
  isUnlimitedInfoRequests,
} from "@/lib/buyer-info-request-limit";
import { getSessionWithUser } from "@/lib/session";
import { promotePendingNdaRequests } from "@/lib/promote-pending-nda";
import { resolveBuyerDocuments } from "@/lib/buyer-documents";
import { buyerCanAccessCompanyDocuments } from "@/lib/company-drive-access";
import BuyerCompanySlots, {
  type BuyerCompanySlot,
} from "@/components/dashboard/BuyerCompanySlots";

export default async function MisEmpresasPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login?from=/dashboard/mis-empresas");
  if (session.user.role === "PROFESSIONAL") redirect("/dashboard/professional");
  if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxConcurrentInfoRequests: true, role: true },
  });
  const unlimited = isUnlimitedInfoRequests(session.user.role);
  const maxSlots =
    getMaxConcurrentInfoRequests(
      session.user.role,
      dbUser?.maxConcurrentInfoRequests
    ) ?? 4;

  await promotePendingNdaRequests(userId);

  const interests = await prisma.userCompanyInterest.findMany({
    where: {
      userId,
      type: "REQUEST_INFO",
    },
    orderBy: { createdAt: "asc" },
  });

  const companyIds = [...new Set(interests.map((i) => i.companyId))];
  const [resolvedList, companyDocs] = await Promise.all([
    Promise.all(companyIds.map((id) => resolveCompanyForBuyerInterest(id))),
    companyIds.length
      ? prisma.company.findMany({
          where: { id: { in: companyIds } },
          select: {
            id: true,
            attachmentsApproved: true,
            buyerDocuments: true,
            buyerTeaserUrl: true,
          },
        })
      : Promise.resolve([]),
  ]);
  const resolvedById = new Map(companyIds.map((id, i) => [id, resolvedList[i]]));
  const docsById = new Map(companyDocs.map((row) => [row.id, row]));

  const slots: BuyerCompanySlot[] = interests.map((row) => {
    const resolved = resolvedById.get(row.companyId)!;
    const docsRow = docsById.get(row.companyId);
    const name =
      resolved.company?.name ??
      resolved.fallbackName ??
      "Empresa (no disponible)";
    const teaserDocuments = buyerCanAccessCompanyDocuments({
      requestStatus: row.status,
      attachmentsApproved: docsRow?.attachmentsApproved ?? false,
      buyerDocuments: docsRow?.buyerDocuments,
      buyerTeaserUrl: docsRow?.buyerTeaserUrl,
    })
      ? resolveBuyerDocuments(docsRow?.buyerDocuments, docsRow?.buyerTeaserUrl).map((doc) => ({
          label: doc.label,
          url: doc.url,
        }))
      : [];
    return {
      companyId: row.companyId,
      interestId: row.id,
      name,
      status: (row.status ?? "PENDING") as RequestStatus,
      published: Boolean(resolved.published && resolved.company),
      company: resolved.company,
      createdAt: row.createdAt,
      teaserDocuments,
    };
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="rounded-xl bg-white border border-[var(--brand-primary)]/10 shadow-sm p-4 md:p-5">
        <h1 className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
          Mis empresas
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--foreground)] opacity-85 max-w-2xl">
          Empresas a las que has solicitado información y el estado de cada solicitud.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--brand-primary)]/10 bg-white p-4 shadow-sm sm:p-5">
        <BuyerCompanySlots
          filled={slots}
          maxSlots={maxSlots}
          isUnlimited={unlimited}
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center pb-4">
        {!unlimited && slots.length < maxSlots && (
          <Link
            href="/companies"
            className="rounded-lg px-4 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white shadow-sm hover:opacity-95 transition"
          >
            Explorar empresas publicadas
          </Link>
        )}
        {unlimited && (
          <Link
            href="/companies"
            className="rounded-lg px-4 py-2 text-xs font-semibold bg-[var(--brand-primary)] text-white shadow-sm hover:opacity-95 transition"
          >
            Explorar más empresas
          </Link>
        )}
        <Link
          href={isAdmin ? "/admin" : "/dashboard/buyer"}
          className="rounded-lg px-4 py-2 text-xs font-semibold border border-[var(--brand-primary)]/35 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/5 transition"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
