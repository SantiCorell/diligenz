import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";

const DRIVE_URL = process.env.NEXT_PUBLIC_BUYER_DOCUMENTS_DRIVE_URL?.trim();

export default async function BuyerDocumentsPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  if (
    session.user.role !== "BUYER" &&
    session.user.role !== "PROFESSIONAL" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Mis documentos
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Accede a tu espacio de documentación personal. Aquí podrás consultar material
          confidencial que el equipo Diligenz comparta contigo (NDA, datas rooms, etc.).
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 md:p-8">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">
          Google Drive personal
        </h2>
        {DRIVE_URL ? (
          <>
            <p className="text-sm text-[var(--foreground)] opacity-90 mb-5">
              Abre tu carpeta asignada en un entorno seguro. Si no tienes acceso, escríbenos y lo
              revisamos.
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
              Tu enlace personal a Drive se configurará cuando el equipo te lo asigne. Mientras
              tanto, completa tu perfil y NDA para agilizar el proceso.
            </p>
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-block text-sm font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Ir a mi perfil
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white/80 p-5 text-sm text-[var(--foreground)] opacity-85">
        <p className="font-medium text-[var(--brand-primary)] mb-1">Firma y verificación</p>
        <p>
          Recuerda firmar el NDA y completar la verificación desde el panel si aún no lo has hecho;
          así podremos compartir documentación sensible contigo.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/dashboard/nda" className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">
            Ir al NDA
          </Link>
          <Link
            href="/dashboard/verification"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            Verificación DNI
          </Link>
        </div>
      </div>

      <p className="text-center">
        <Link
          href="/dashboard/buyer"
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          ← Volver al panel del inversor
        </Link>
      </p>
    </div>
  );
}
