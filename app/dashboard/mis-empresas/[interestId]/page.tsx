import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionWithUser } from "@/lib/session";
import { resolveCompanyForBuyerInterest } from "@/lib/buyer-company-resolve";
import { resolveBuyerDocuments } from "@/lib/buyer-documents";
import { buyerCanAccessCompanyDocuments } from "@/lib/company-drive-access";
import { buyerMomentCopy, normalizeRequestStatus } from "@/lib/info-request-pipeline";
import BuyerRequestDecision from "@/components/dashboard/BuyerRequestDecision";

type Props = { params: Promise<{ interestId: string }> };

export default async function BuyerRequestDetailPage({ params }: Props) {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { interestId } = await params;
  const interest = await prisma.userCompanyInterest.findFirst({
    where: { id: interestId, userId: session.user.id, type: "REQUEST_INFO" },
  });
  if (!interest) notFound();

  const [resolved, companyRow] = await Promise.all([
    resolveCompanyForBuyerInterest(interest.companyId),
    prisma.company.findUnique({
      where: { id: interest.companyId },
      select: {
        attachmentsApproved: true,
        buyerDocuments: true,
        buyerTeaserUrl: true,
        reference: true,
      },
    }),
  ]);

  const stage = normalizeRequestStatus(interest.status);
  const moment = buyerMomentCopy(stage);
  const name = resolved.company?.name ?? resolved.fallbackName ?? "Empresa";
  const docs = resolveBuyerDocuments(companyRow?.buyerDocuments, companyRow?.buyerTeaserUrl);
  const canSeeTeaser = buyerCanAccessCompanyDocuments({
    requestStatus: interest.status,
    attachmentsApproved: companyRow?.attachmentsApproved ?? false,
    buyerDocuments: companyRow?.buyerDocuments,
    buyerTeaserUrl: companyRow?.buyerTeaserUrl,
  });
  const grantedAt = interest.statusUpdatedAt ?? interest.createdAt;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-[var(--foreground)]/70">
        <Link href="/dashboard/mis-empresas" className="hover:underline">Mis empresas</Link>
        <span> / {name}</span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
          {stage === "TEASER" || stage === "CONVERSATIONS" || stage === "CLOSED" ? "Acceso concedido" : moment.title}
        </span>
        <span className="text-xs text-[var(--foreground)]/60">
          Actualizado el {grantedAt.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <article className="page-card page-card-padded space-y-4">
        <h1 className="text-2xl font-bold text-[var(--brand-dark)]">{name}</h1>
        <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
          {resolved.company?.description}
        </p>
        {resolved.company?.reference && (
          <p className="text-xs font-medium text-[var(--foreground)]/55">#{resolved.company.reference}</p>
        )}

        {canSeeTeaser && docs.length > 0 && (
          <ul className="space-y-2">
            {docs.map((doc, index) => (
              <li key={`${doc.url}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--brand-primary)]/10 bg-[var(--brand-bg)]/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-dark)]">{doc.label}</p>
                  <p className="text-xs text-[var(--foreground)]/60">Documento confidencial, uso personal — no compartir</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--brand-primary)]/30 px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
                >
                  Ver teaser
                </a>
              </li>
            ))}
          </ul>
        )}

        {stage === "TEASER" && !canSeeTeaser && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Tu gestor te ha concedido el acceso, pero el documento resumen todavía no está publicado. Te avisaremos en cuanto esté listo.
          </p>
        )}

        {stage === "TEASER" ? (
          <BuyerRequestDecision interestId={interest.id} />
        ) : (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-4 text-sm text-violet-950">
            <p className="font-semibold">{moment.title}</p>
            <p className="mt-1">{moment.body}</p>
          </div>
        )}
      </article>

      <Link href="/dashboard/mis-empresas" className="inline-block text-sm font-semibold text-[var(--brand-primary)] hover:underline">
        ← Volver a mis empresas
      </Link>
    </div>
  );
}
