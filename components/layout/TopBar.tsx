import Link from "next/link";

export default function TopBar() {
  return (
    <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-bg-mint)]/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-2.5 text-sm sm:flex-row sm:px-6">
        <p className="text-center text-xs font-medium text-[var(--brand-dark)] sm:text-left sm:text-sm">
          <span className="sm:hidden">Valoración gratis · Sin registro</span>
          <span className="hidden sm:inline">
            Valora tu empresa gratis en 2 minutos · Sin registro obligatorio
          </span>
        </p>
        <Link
          href="/sell"
          className="flex min-h-[40px] shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95 sm:min-h-0 sm:text-sm"
        >
          Valorar ahora →
        </Link>
      </div>
    </div>
  );
}
