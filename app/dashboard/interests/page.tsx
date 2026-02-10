import Link from "next/link";

export default function InterestsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Solicitudes enviadas
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Estado de tus solicitudes de información y NDAs.
        </p>
      </div>
      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-8">
        <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Gestiona tus solicitudes desde &quot;De mi interés&quot;.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/companies/mi-interes"
            className="inline-block rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Ver De mi interés
          </Link>
          <Link
            href="/dashboard/buyer"
            className="inline-block rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition"
          >
            ← Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
