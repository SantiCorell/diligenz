import Link from "next/link";

export default function InterestsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-2xl bg-[var(--brand-primary)]/5 border-2 border-[var(--brand-primary)]/20 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Solicitudes enviadas
        </h1>
        <p className="mt-1 text-[var(--foreground)] opacity-90">
          Estado de tus solicitudes de información y NDAs.
        </p>
      </div>
      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 shadow-lg">
        <p className="text-[var(--foreground)] opacity-85">
          Gestiona tus solicitudes desde &quot;De mi interés&quot;.
        </p>
        <Link
          href="/companies/mi-interes"
          className="mt-4 inline-block rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white text-sm font-medium hover:opacity-90 transition"
        >
          Ver De mi interés
        </Link>
        <Link
          href="/dashboard/buyer"
          className="mt-4 ml-4 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          ← Volver al panel
        </Link>
      </div>
    </div>
  );
}
