import Link from "next/link";

export default function DashboardVerificationPage() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-8 text-center">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)] mb-2">
        Verificación de DNI
      </h1>
      <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90 mb-6">
        Esta funcionalidad estará disponible próximamente. Podrás verificar tu identidad desde aquí.
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
