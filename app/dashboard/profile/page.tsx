import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserDniPendingReview } from "@/lib/user-documents/dni-status";
import { getSessionWithUser } from "@/lib/session";
import UserDrivePanel from "@/components/dashboard/UserDrivePanel";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import ProfileCheckIndicator from "@/components/dashboard/ProfileCheckIndicator";

export default async function DashboardProfilePage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const user = session.user;
  const profileComplete =
    Boolean(user.phone?.trim() && user.name?.trim()) || user.profileVerifiedByAdmin;

  const dniPendingReview = await getUserDniPendingReview(user.id, user.dniVerified);
  const isBuyer = user.role === "BUYER" || user.role === "ADMIN";
  const isSellerOnly = user.role === "SELLER";
  const isProfessional = user.role === "PROFESSIONAL";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-primary)]">Mi perfil</h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Estado de verificación arriba en el panel; aquí puedes editar tus datos de contacto cuando
          quieras.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-4">
          Completar verificación
        </h2>
        <ul className="space-y-3 text-sm text-[var(--foreground)]">
          <CheckRow ok={user.emailVerified} label="Email verificado" />
          <CheckRow
            ok={user.ndaSigned}
            label={
              user.role === "PROFESSIONAL"
                ? "Acuerdo de colaboración firmado"
                : user.role === "SELLER"
                  ? "Mandato de venta firmado"
                  : "Mandato de compra firmado"
            }
            href="/dashboard/nda"
          />
          <CheckRow
            ok={user.dniVerified}
            pending={dniPendingReview}
            label={dniPendingReview ? "DNI — pendiente de verificar" : "DNI validado"}
            href="/dashboard/verification"
          />
          <CheckRow
            ok={profileComplete}
            label="Perfil completo (nombre y teléfono)"
            href="/dashboard/profile"
          />
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white shadow-md p-6 space-y-2">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Datos de la cuenta</h2>
        <p className="text-xs text-[var(--foreground)] opacity-70 pb-2">
          Modifica nombre y teléfono. El email no se puede cambiar aquí.
        </p>
        <ProfileEditor
          email={user.email}
          initialName={user.name}
          initialPhone={user.phone}
          profileVerifiedByAdmin={user.profileVerifiedByAdmin}
        />
        <div className="pt-2 border-t border-[var(--brand-primary)]/10">
          <p className="text-xs text-[var(--foreground)] opacity-65">
            Rol:{" "}
            <span className="font-medium">
              {user.role === "BUYER" && "Comprador / inversor"}
              {user.role === "SELLER" && "Vendedor"}
              {user.role === "PROFESSIONAL" && "Profesional"}
              {user.role === "ADMIN" && "Administrador"}
            </span>
          </p>
        </div>
      </div>

      {isProfessional && (
        <div className="rounded-2xl border border-dashed border-[var(--brand-primary)]/20 bg-[var(--brand-bg)]/40 p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Documentación</h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
            Acuerdo de colaboración, verificación de identidad y documentos asociados a tu cuenta
            profesional.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/nda"
              className="inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white hover:opacity-95"
            >
              Firmar acuerdo / mandato
            </Link>
            <Link
              href="/dashboard/verification"
              className="inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/25 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
            >
              Verificación DNI
            </Link>
          </div>
        </div>
      )}

      {isSellerOnly && (
        <UserDrivePanel
          title="Google Drive (vendedor)"
          driveUrl={
            user.documentsDriveFolderUrl?.trim() ||
            process.env.NEXT_PUBLIC_SELLER_DOCUMENTS_DRIVE_URL?.trim() ||
            ""
          }
          description="Abre la carpeta que Diligenz haya compartido contigo para subir o consultar archivos. Cada empresa tiene además su propia subcarpeta de documentación."
        />
      )}

      {isProfessional && (
        <UserDrivePanel
          title="Google Drive (profesional)"
          driveUrl={user.documentsDriveFolderUrl?.trim() || ""}
          description="Abre tu carpeta compartida con Diligenz. Cada empresa que subas tendrá su propia subcarpeta de documentos."
        />
      )}

      {isBuyer && (
        <UserDrivePanel
          title="Google Drive (inversor)"
          driveUrl={
            user.documentsDriveFolderUrl?.trim() ||
            process.env.NEXT_PUBLIC_BUYER_DOCUMENTS_DRIVE_URL?.trim() ||
            ""
          }
          description="Abre tu carpeta personal en un entorno seguro. Aquí encontrarás documentación confidencial que el equipo Diligenz comparta contigo (mandato, datas rooms, etc.)."
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/nda"
          className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          Ir a firmar mandato
        </Link>
        <Link
          href="/dashboard/verification"
          className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          Verificación DNI
        </Link>
        {isBuyer && (
          <Link
            href="/dashboard/buyer"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            ← Volver al panel del inversor
          </Link>
        )}
        {isSellerOnly && (
          <Link
            href="/dashboard/seller"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            ← Volver al panel del vendedor
          </Link>
        )}
        {isProfessional && (
          <Link
            href="/dashboard/professional"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            ← Volver al dashboard
          </Link>
        )}
        {!isBuyer && !isSellerOnly && !isProfessional && (
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            ← Volver al panel
          </Link>
        )}
      </div>
    </div>
  );
}

function CheckRow({
  ok,
  pending,
  label,
  href,
}: {
  ok: boolean;
  pending?: boolean;
  label: string;
  href?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2.5">
        <ProfileCheckIndicator state={ok ? "done" : pending ? "pending" : "todo"} />
        <span>{label}</span>
      </span>
      {!ok && href && (
        <Link
          href={href}
          className="text-xs font-semibold text-[var(--brand-primary)] hover:underline shrink-0"
        >
          {pending ? "Ver estado" : "Completar"}
        </Link>
      )}
    </li>
  );
}
