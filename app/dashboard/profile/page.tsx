import Link from "next/link";

export default function DashboardProfilePage() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border-2 border-[var(--brand-primary)]/15 bg-white p-8 shadow-lg text-center">
      <h1 className="text-xl font-bold text-[var(--brand-primary)] mb-2">
        Completar perfil
      </h1>
      <p className="text-[var(--foreground)] opacity-90 mb-6">
        Puedes completar tu perfil y datos de contacto desde la configuración de tu cuenta. Esta página se ampliará próximamente.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
      >
        Volver al panel
      </Link>
    </div>
  );
}
