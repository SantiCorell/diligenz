import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";

const DRIVE_URL = process.env.NEXT_PUBLIC_SELLER_DOCUMENTS_DRIVE_URL?.trim();

export default async function SellerDocumentsPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Mis documentos
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Documentación de tus proyectos (mandatos, NDA, etc.) y acceso a tu carpeta en Drive cuando
          el equipo te la haya asignado.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 md:p-8">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
          Google Drive (vendedor)
        </h2>
        {DRIVE_URL ? (
          <>
            <p className="text-sm text-[var(--foreground)] opacity-90 mb-5">
              Abre la carpeta que Diligenz haya compartido contigo para subir o consultar archivos.
            </p>
            <a
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Abrir mi Drive →
            </a>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-bg)]/60 px-4 py-5 text-sm text-[var(--foreground)] opacity-90">
            <p>
              Tu enlace personal a Drive se mostrará aquí cuando lo configuremos. Mientras tanto,
              usa el apartado de comentarios sobre documentación en cada empresa del panel si
              quieres dejar una nota para el equipo.
            </p>
            <Link
              href="/dashboard/seller"
              className="mt-3 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Ir a mis empresas
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white/80 p-5 text-sm text-[var(--foreground)] opacity-85">
        <p className="font-medium text-[var(--brand-primary)] mb-1">Firma y publicación</p>
        <p>
          Completa la firma de documentos desde el flujo de cada proyecto. Una vez el anuncio esté
          publicado en la web, los datos del anuncio solo los modifica Diligenz desde administración.
        </p>
        <Link
          href="/documents"
          className="mt-3 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          Ver estado de documentación por proyecto
        </Link>
      </div>

      <p className="text-center">
        <Link
          href="/dashboard/seller"
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          ← Volver al panel del vendedor
        </Link>
      </p>
    </div>
  );
}
