import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MandatoSignWizard from "@/components/mandato/MandatoSignWizard";

const ALLOWED = new Set(["SELLER", "PROFESSIONAL", "ADMIN"]);

export default async function DashboardMandatoPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  if (!ALLOWED.has(session.user.role)) {
    redirect("/dashboard/buyer");
  }

  const mandate = await prisma.salesMandate.findUnique({
    where: { userId: session.userId },
    select: { signedAt: true, contactEmail: true },
  });

  return (
    <MandatoSignWizard
      prefill={{
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone,
      }}
      alreadySigned={session.user.ndaSigned || Boolean(mandate)}
      signedAt={mandate?.signedAt?.toISOString() ?? null}
      signedEmail={mandate?.contactEmail ?? session.user.email}
    />
  );
}
