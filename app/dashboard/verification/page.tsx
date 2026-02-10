import Link from "next/link";

export default function DashboardVerificationPage() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border-2 border-[var(--brand-primary)]/15 bg-white p-8 shadow-lg text-center">
      <h1 className="text-xl font-bold text-[var(--brand-primary)] mb-2">
        Verificación de DNI
      </h1>
      <p className="text-[var(--foreground)] opacity-90 mb-6">
        Esta funcionalidad estará disponible próximamente. Podrás verificar tu identidad desde aquí.
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
