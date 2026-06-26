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

  const interests = await prisma.userCompanyInterest.findMany({
    where: {
      userId,
      type: "REQUEST_INFO",
      ...(unlimited ? {} : { status: { in: ["PENDING", "MANAGED"] } }),
    },
    orderBy: { createdAt: "asc" },
  });

  const companyIds = [...new Set(interests.map((i) => i.companyId))];
  const resolvedList = await Promise.all(
    companyIds.map((id) => resolveCompanyForBuyerInterest(id))
  );
  const resolvedById = new Map(companyIds.map((id, i) => [id, resolvedList[i]]));

  const slots: BuyerCompanySlot[] = interests.map((row) => {
    const resolved = resolvedById.get(row.companyId)!;
    const name =
      resolved.company?.name ??
      resolved.fallbackName ??
      "Empresa (no disponible)";
    return {
      companyId: row.companyId,
      name,
      status: (row.status ?? "PENDING") as RequestStatus,
      published: Boolean(resolved.published && resolved.company),
      company: resolved.company,
      createdAt: row.createdAt,
    };
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="rounded-xl bg-white border border-[var(--brand-primary)]/10 shadow-sm p-4 md:p-5">
        <h1 className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
          Mis empresas
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--foreground)] opacity-85 max-w-2xl">
          {unlimited
            ? "Empresas a las que has pedido información y el estado de cada solicitud."
            : `Puedes tener hasta ${maxSlots} empresas activas a la vez. Cada espacio es una solicitud en curso.`}
        </p>
        <div className="mt-3 rounded-lg border border-amber-200/70 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          <p className="font-medium text-amber-950">¿Has solicitado información?</p>
          <p className="mt-0.5 opacity-95 leading-snug">
            Un agente se pondrá en contacto contigo. Revisa el estado de cada empresa abajo.
          </p>
        </div>
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
