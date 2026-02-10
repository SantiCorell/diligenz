import Link from "next/link";

export default function DashboardProfilePage() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-8 text-center">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)] mb-2">
        Completar perfil
      </h1>
      <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90 mb-6">
        Puedes completar tu perfil y datos de contacto desde la configuración de tu cuenta. Esta página se ampliará próximamente.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
      >
        Volver al panel
      </Link>
    </div>
  );
}
