import Link from "next/link";

export default function BuyerDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-2xl bg-[var(--brand-primary)]/5 border-2 border-[var(--brand-primary)]/20 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Panel del inversor
        </h1>
        <p className="mt-1 text-[var(--foreground)] opacity-90">
          Descubre oportunidades y gestiona tus intereses de forma privada.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-[var(--brand-primary)] border-b border-[var(--brand-primary)]/20 pb-3">
          Resumen
        </h2>
        <p className="mt-4 text-[var(--foreground)] opacity-85 max-w-2xl">
          Explora empresas, guarda favoritas o solicita información cuando tengas
          tu perfil completo y NDA firmado.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/companies"
            className="rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-white text-sm font-medium hover:opacity-90 transition shadow-md"
          >
            Explorar empresas
          </Link>
          <Link
            href="/companies/mi-interes"
            className="rounded-xl border-2 border-[var(--brand-primary)]/40 px-6 py-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition"
          >
            De mi interés
          </Link>
          <Link
            href="/dashboard/favorites"
            className="rounded-xl border-2 border-[var(--brand-primary)]/30 px-6 py-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
          >
            Ver favoritas
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-[var(--brand-primary)]">
            Proyectos favoritos
          </h3>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Guarda empresas para revisarlas más tarde.
          </p>
          <Link
            href="/dashboard/favorites"
            className="mt-4 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver favoritas →
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-[var(--brand-primary)]">
            Solicitudes enviadas
          </h3>
          <p className="mt-2 text-sm text-[var(--foreground)] opacity-85">
            Sigue el estado de tus solicitudes y NDAs.
          </p>
          <Link
            href="/dashboard/interests"
            className="mt-4 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver solicitudes →
          </Link>
        </div>
      </div>
    </div>
  );
}
