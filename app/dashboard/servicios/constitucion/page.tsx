import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { loadServiciosContext } from "@/lib/servicios-panel-data";
import ConstitucionServicio from "@/components/servicios/panel/ConstitucionServicio";

export default async function ConstitucionServicioPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const { constitucion, agent, driveUrl } = await loadServiciosContext(
    session.user.id,
    session.user.email
  );

  if (!constitucion) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#ece6f5] bg-white px-6 py-10">
        <h1 className="text-2xl font-extrabold text-[var(--brand-dark)]">Constitución de sociedad limitada</h1>
        <p className="mt-2 text-sm text-[var(--foreground)]/65">
          Aún no hay un expediente abierto con este correo.
        </p>
        <Link
          href="/servicios/constitucion-sl"
          className="mt-5 inline-flex rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Solicitar la constitución
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <ConstitucionServicio requestId={constitucion.id} agent={agent} driveUrl={driveUrl} />
    </div>
  );
}
