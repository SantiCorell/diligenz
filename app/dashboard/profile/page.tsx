import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import ProfileEditor from "@/components/dashboard/ProfileEditor";

export default async function DashboardProfilePage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");

  const user = session.user;
  const profileComplete =
    Boolean(user.phone?.trim() && user.name?.trim()) || user.profileVerifiedByAdmin;

  const isBuyerLike = user.role === "BUYER" || user.role === "PROFESSIONAL";
  const isSellerLike = user.role === "SELLER" || user.role === "PROFESSIONAL";

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
          <CheckRow ok={user.ndaSigned} label="NDA firmado" href="/dashboard/nda" />
          <CheckRow ok={user.dniVerified} label="DNI validado" href="/dashboard/verification" />
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
              {user.role === "PROFESSIONAL" && "Profesional (inversor y vendedor)"}
              {user.role === "ADMIN" && "Administrador"}
            </span>
          </p>
        </div>
      </div>

      {isBuyerLike && user.role !== "SELLER" && (
        <div className="rounded-2xl border border-dashed border-[var(--brand-primary)]/20 bg-[var(--brand-bg)]/40 p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Documentación inversor
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
            Accede a tu espacio de documentos y, si está configurado, a tu Google Drive personal.
          </p>
          <Link
            href="/dashboard/buyer/documents"
            className="mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white hover:opacity-95"
          >
            Mis documentos y Drive (inversor)
          </Link>
        </div>
      )}

      {isSellerLike && user.role !== "BUYER" && (
        <div className="rounded-2xl border border-dashed border-[var(--brand-primary)]/20 bg-[var(--brand-bg)]/40 p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Documentación vendedor
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
            Carpeta Drive del vendedor y seguimiento de documentos por proyecto.
          </p>
          <Link
            href="/dashboard/seller/documents"
            className="mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white hover:opacity-95"
          >
            Mis documentos y Drive (vendedor)
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/nda"
          className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          Ir a firmar NDA
        </Link>
        <Link
          href="/dashboard/verification"
          className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          Verificación DNI
        </Link>
        {isBuyerLike && (
          <Link
            href="/dashboard/buyer"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            ← Volver al panel del inversor
          </Link>
        )}
        {isSellerLike && (
          <Link
            href="/dashboard/seller"
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            ← Volver al panel del vendedor
          </Link>
        )}
        {!isBuyerLike && !isSellerLike && (
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
  label,
  href,
}: {
  ok: boolean;
  label: string;
  href?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        {ok ? "✅" : "⬜"} {label}
      </span>
      {!ok && href && (
        <Link
          href={href}
          className="text-xs font-semibold text-[var(--brand-primary)] hover:underline shrink-0"
        >
          Completar
        </Link>
      )}
    </li>
  );
}
