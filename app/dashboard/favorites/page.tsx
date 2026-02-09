import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-2xl bg-[var(--brand-primary)]/5 border-2 border-[var(--brand-primary)]/20 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Favoritas
        </h1>
        <p className="mt-1 text-[var(--foreground)] opacity-90">
          Empresas que has guardado para revisar más tarde.
        </p>
      </div>
      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-8 shadow-lg">
        <p className="text-[var(--foreground)] opacity-85">
          Aquí aparecerán tus empresas favoritas. Mientras tanto, puedes explorar el catálogo.
        </p>
        <Link
          href="/dashboard/buyer"
          className="mt-4 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          ← Volver al panel del inversor
        </Link>
      </div>
    </div>
  );
}
