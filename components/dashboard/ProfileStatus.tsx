import Link from "next/link";
import ProfileCheckIndicator from "@/components/dashboard/ProfileCheckIndicator";

type Props = {
  ndaSigned: boolean;
  dniVerified: boolean;
  /** Anverso y reverso subidos, aún sin validar por admin */
  dniPendingReview?: boolean;
  profileComplete: boolean;
  profileVerifiedByAdmin?: boolean;
  userName?: string | null;
  userPhone?: string | null;
  role?: "BUYER" | "SELLER" | "ADMIN" | "PROFESSIONAL";
  /** En /dashboard/profile no mostrar enlace a la propia página */
  suppressDetailLink?: boolean;
  variant?: "card" | "banner";
};

export default function ProfileStatus({
  ndaSigned,
  dniVerified,
  dniPendingReview = false,
  profileComplete,
  profileVerifiedByAdmin = false,
  userName,
  userPhone,
  role,
  suppressDetailLink,
  variant = "card",
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
    {
      label:
        role === "PROFESSIONAL"
          ? "Acuerdo de colaboración firmado"
          : role === "SELLER"
            ? "Mandato de venta firmado"
            : "Mandato de compra firmado",
      ok: ndaSigned,
      action: "/dashboard/nda",
    },
    {
      label: dniVerified
        ? "DNI validado"
        : dniPendingReview
          ? "DNI — pendiente de verificar"
          : "DNI validado",
      ok: dniVerified,
      pending: dniPendingReview,
      action: "/dashboard/verification",
    },
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

  const pendingLabels = items.filter((item) => !item.ok).map((item) => item.label.replace(" firmado", "").replace(" validado", ""));
  const bannerHint =
    pendingLabels.length === 0
      ? "Verificación completa"
      : `te falta ${pendingLabels.slice(0, 2).join(" y ").toLowerCase()} para avanzar más rápido`;

  if (variant === "banner") {
    if (progress >= 100) return null;
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-sm text-violet-950">
        <p>
          <span className="font-semibold">Verificación: {progress}% completo</span>
          <span className="text-violet-900/80"> — {bannerHint}</span>
        </p>
        <Link
          href={items.find((item) => !item.ok)?.action ?? "/dashboard/profile"}
          className="shrink-0 text-sm font-semibold text-[var(--brand-primary)] hover:underline"
        >
          Completar →
        </Link>
      </div>
    );
  }

  if (progress >= 100) return null;

  const heading =
    role === "SELLER"
      ? "Verificación de vendedor"
      : role === "PROFESSIONAL"
        ? "Verificación de profesional"
        : "Verificación de comprador";

  return (
    <div className="page-card page-card-padded">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--brand-dark)]">{heading}</h2>
        <span className="shrink-0 text-sm font-semibold text-[var(--brand-primary)]">{progress}% completo</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
        <div className="h-full rounded-full bg-[var(--brand-primary)]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mb-4 text-sm text-[var(--foreground)]/75">
        Completa estos pasos para poder solicitar información confidencial a los vendedores.
      </p>
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
      <ul className="divide-y divide-[var(--brand-primary)]/10 text-sm text-[var(--foreground)]">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-2 py-3 first:pt-0">
            <span className="flex items-center gap-2.5 min-w-0">
              <ProfileCheckIndicator
                state={
                  item.ok ? "done" : "pending" in item && item.pending ? "pending" : "todo"
                }
              />
              <span className="truncate">{item.label}</span>
            </span>

            {!item.ok && item.action && (
              <Link
                href={item.action}
                className="shrink-0 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                {"pending" in item && item.pending ? "Ver estado" : "Completar"}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {showDetailProfileLink && (
        <Link href="/dashboard/profile" className="mt-2 inline-block text-xs font-medium text-[var(--brand-primary)] hover:underline">
          Ver perfil completo →
        </Link>
      )}
    </div>
  );
}
