import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import MandatoSignWizard from "@/components/mandato/MandatoSignWizard";
import MandatoCompraSignWizard from "@/components/mandato/MandatoCompraSignWizard";
import MandatoColaboracionSignWizard from "@/components/mandato/MandatoColaboracionSignWizard";

const SELLER_ROLES = new Set(["SELLER", "ADMIN"]);
const BUYER_ROLES = new Set(["BUYER", "ADMIN"]);
const PROFESSIONAL_ROLES = new Set(["PROFESSIONAL"]);

export default async function DashboardMandatoPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const role = session.user.role;
  const panelHref = dashboardPathForRole(role);
  const prefill = {
    name: session.user.name,
    email: session.user.email,
    phone: session.user.phone,
  };

  if (PROFESSIONAL_ROLES.has(role)) {
    const agreement = await prisma.collaborationAgreement.findUnique({
      where: { userId: session.userId },
      select: { signedAt: true, contactEmail: true },
    });

    return (
      <MandatoColaboracionSignWizard
        prefill={prefill}
        alreadySigned={session.user.ndaSigned || Boolean(agreement)}
        signedAt={agreement?.signedAt?.toISOString() ?? null}
        signedEmail={agreement?.contactEmail ?? session.user.email}
        panelHref={panelHref}
      />
    );
  }

  if (BUYER_ROLES.has(role) && role === "BUYER") {
    const mandate = await prisma.purchaseMandate.findUnique({
      where: { userId: session.userId },
      select: { signedAt: true, contactEmail: true },
    });

    return (
      <MandatoCompraSignWizard
        prefill={prefill}
        alreadySigned={session.user.ndaSigned || Boolean(mandate)}
        signedAt={mandate?.signedAt?.toISOString() ?? null}
        signedEmail={mandate?.contactEmail ?? session.user.email}
        panelHref={panelHref}
      />
    );
  }

  if (!SELLER_ROLES.has(role)) {
    redirect("/dashboard");
  }

  const mandate = await prisma.salesMandate.findUnique({
    where: { userId: session.userId },
    select: { signedAt: true, contactEmail: true },
  });

  return (
    <MandatoSignWizard
      prefill={prefill}
      alreadySigned={session.user.ndaSigned || Boolean(mandate)}
      signedAt={mandate?.signedAt?.toISOString() ?? null}
      signedEmail={mandate?.contactEmail ?? session.user.email}
      panelHref={panelHref}
    />
  );
}
