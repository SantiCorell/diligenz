import Link from "next/link";

export default function BuyerDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Panel del inversor
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[var(--foreground)] opacity-90">
          Descubre oportunidades y gestiona tus intereses de forma privada.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-8">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)] border-b border-[var(--brand-primary)]/10 pb-3">
          Resumen
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-2xl">
          Explora empresas, guarda favoritas o solicita información cuando tengas
          tu perfil completo y NDA firmado.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/companies"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Explorar empresas
          </Link>
          <Link
            href="/companies/mi-interes"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition"
          >
            De mi interés
          </Link>
          <Link
            href="/dashboard/favorites"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition"
          >
            Ver favoritas
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-[var(--brand-primary)]">
            Proyectos favoritos
          </h3>
          <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
            Guarda empresas para revisarlas más tarde.
          </p>
          <Link
            href="/dashboard/favorites"
            className="mt-4 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver favoritas →
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-[var(--brand-primary)]">
            Solicitudes enviadas
          </h3>
          <p className="mt-2 text-sm sm:text-base text-[var(--foreground)] opacity-90">
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
