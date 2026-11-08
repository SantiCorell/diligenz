import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { loadServiciosContext } from "@/lib/servicios-panel-data";
import CarpetaDocumentos from "@/components/servicios/panel/CarpetaDocumentos";

export default async function ServiciosDocumentosPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  const { driveUrl } = await loadServiciosContext(session.user.id, session.user.email);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/dashboard/servicios/constitucion" className="text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]">Mi servicio</Link>
        <span className="font-semibold text-[var(--brand-primary)]">Documentos</span>
        <Link href="/dashboard/servicios/facturacion" className="text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]">Facturación</Link>
      </div>
      <h1 className="text-2xl font-extrabold text-[var(--brand-dark)]">Mis documentos</h1>
      <CarpetaDocumentos driveUrl={driveUrl} />
    </div>
  );
}
