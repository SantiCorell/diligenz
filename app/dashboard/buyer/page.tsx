import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/user-display";
import { getSessionWithUser } from "@/lib/session";
import { getUserDniPendingReview } from "@/lib/user-documents/dni-status";
import ProfileStatus from "@/components/dashboard/ProfileStatus";
import {
  countActiveInfoRequests,
  getMaxConcurrentInfoRequests,
} from "@/lib/buyer-info-request-limit";

export default async function BuyerDashboardPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role === "PROFESSIONAL") redirect("/dashboard/professional");

  const userId = session.user.id;
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxConcurrentInfoRequests: true, role: true },
  });
  const maxSlots = getMaxConcurrentInfoRequests(
    session.user.role,
    dbUser?.maxConcurrentInfoRequests
  );

  const [inReview, activeInfo, dniPendingReview] = await Promise.all([
    prisma.userCompanyInterest.count({
      where: { userId, type: "REQUEST_INFO", status: "IN_REVIEW" },
    }),
    countActiveInfoRequests(userId),
    getUserDniPendingReview(userId, session.user.dniVerified),
  ]);

  const displayName = session.user.name?.trim() || getDisplayName(session.user.email);
  const profileComplete =
    Boolean(session.user.phone?.trim() && session.user.name?.trim()) ||
    session.user.profileVerifiedByAdmin;
  const stepsLeft = [session.user.ndaSigned, session.user.dniVerified, profileComplete].filter((ok) => !ok).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ProfileStatus
        ndaSigned={session.user.ndaSigned}
        dniVerified={session.user.dniVerified}
        dniPendingReview={dniPendingReview}
        profileComplete={profileComplete}
        profileVerifiedByAdmin={session.user.profileVerifiedByAdmin}
        userName={session.user.name}
        userPhone={session.user.phone}
        role={session.user.role === "ADMIN" ? "BUYER" : session.user.role}
      />

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#9b6dff] via-[#7c4dff] to-[#5b34d6] px-6 py-8 text-white shadow-lg sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Panel del comprador</p>
        <h1 className="mt-2 text-3xl font-bold">Hola{displayName ? `, ${displayName}` : ""}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          {stepsLeft > 0
            ? `Te faltan ${stepsLeft} paso${stepsLeft === 1 ? "" : "s"} para poder solicitar información confidencial a los vendedores. El marketplace sigue disponible mientras tanto.`
            : inReview > 0
              ? `Tienes ${inReview} solicitud${inReview === 1 ? "" : "es"} en revisión. Tu gestor te responderá en cuanto pueda.`
              : "Tu verificación está lista. Explora empresas y solicita información cuando encuentres una operación."}
          {maxSlots != null && (
            <> Llevas {activeInfo}/{maxSlots} solicitudes activas.</>
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {stepsLeft > 0 && (
            <Link href="/dashboard/nda" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#5b34d6] hover:bg-white/90">
              Completar mi verificación
            </Link>
          )}
          <Link href="/companies" className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
            Explorar empresas publicadas
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/dashboard/mis-empresas" className="page-card page-card-padded group">
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">Mis empresas</h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">Tus solicitudes de información y el estado de cada una.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">Ver solicitudes ({activeInfo}) →</span>
        </Link>
        <Link href="/companies" className="page-card page-card-padded group">
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">Explorar empresas</h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">Catálogo publicado: sectores, cifras orientativas y fichas.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">Ir al marketplace →</span>
        </Link>
        <Link href="/contact" className="page-card page-card-padded group">
          <h2 className="text-lg font-semibold text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)]">¿Necesitas ayuda?</h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/75">Contacto directo y valoraciones orientativas.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-primary)]">Contactar →</span>
        </Link>
      </div>
    </div>
  );
}
