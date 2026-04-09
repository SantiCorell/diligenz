import Link from "next/link";

type Props = {
  emailVerified: boolean;
  ndaSigned: boolean;
  dniVerified: boolean;
  profileComplete: boolean;
  profileVerifiedByAdmin?: boolean;
  userName?: string | null;
  userPhone?: string | null;
  role?: "BUYER" | "SELLER" | "ADMIN" | "PROFESSIONAL";
  /** En /dashboard/profile no mostrar enlace a la propia página */
  suppressDetailLink?: boolean;
};

export default function ProfileStatus({
  emailVerified,
  ndaSigned,
  dniVerified,
  profileComplete,
  profileVerifiedByAdmin = false,
  userName,
  userPhone,
  role,
  suppressDetailLink,
}: Props) {
  const missingProfile: string[] = [];
  if (!userName?.trim()) missingProfile.push("nombre");
  if (!userPhone?.trim()) missingProfile.push("teléfono");
  const showProfileWarning =
    missingProfile.length > 0 &&
    !profileVerifiedByAdmin &&
    (role === "BUYER" ||
      role === "SELLER" ||
      role === "PROFESSIONAL" ||
      role === "ADMIN");

  const items = [
    { label: "Email verificado", ok: emailVerified },
    { label: "NDA firmado", ok: ndaSigned, action: "/dashboard/nda" },
    { label: "DNI validado", ok: dniVerified, action: "/dashboard/verification" },
    {
      label: "Perfil completo (nombre y teléfono)",
      ok: profileComplete,
      action: "/dashboard/profile",
    },
  ];

  const completed = items.filter((i) => i.ok).length;
  const progress = Math.round((completed / items.length) * 100);

  const showDetailProfileLink =
    !suppressDetailLink &&
    (role === "BUYER" || role === "PROFESSIONAL" || role === "SELLER");

  return (
    <div className="rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white p-6 shadow-lg">
      {showProfileWarning && (
        <div
          className="mb-4 rounded-xl border border-amber-300/90 bg-amber-50 px-3 py-2.5 text-xs text-amber-950"
          role="status"
        >
          <span className="font-semibold">Datos incompletos:</span> falta{" "}
          {missingProfile.join(" y ")}.{" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            Completar en Mi perfil
          </Link>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Mi perfil
        </h2>
        {showDetailProfileLink && (
          <Link
            href="/dashboard/profile"
            className="text-xs font-medium text-[var(--brand-primary)] hover:underline shrink-0"
          >
            Ver perfil completo →
          </Link>
        )}
      </div>

      <ul className="space-y-3 text-sm text-[var(--foreground)]">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {item.ok ? "✅" : "⬜"} {item.label}
            </span>

            {!item.ok && item.action && (
              <Link
                href={item.action}
                className="text-xs font-medium text-[var(--brand-primary)] hover:underline"
              >
                Completar
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 text-xs text-[var(--foreground)] opacity-80">
        Progreso {progress}%
        <div className="mt-1 h-2 w-full rounded-full bg-[var(--brand-bg)]">
          <div
            className="h-2 rounded-full bg-[var(--brand-primary)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
