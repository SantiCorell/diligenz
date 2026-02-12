import Link from "next/link";

export default function TopBar() {
  return (
    <div className="bg-orange-50 border-b border-orange-200 rounded-b-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <p className="text-orange-900 font-semibold text-center sm:text-left text-xs sm:text-sm">
          <span className="sm:hidden">Valoración gratis · Sin registro</span>
          <span className="hidden sm:inline">Valora tu empresa gratis en 2 minutos · Sin registro obligatorio</span>
        </p>
        <Link
          href="/sell"
          className="rounded-lg bg-orange-500 px-4 py-2.5 sm:py-1.5 text-white text-sm font-semibold hover:bg-orange-600 transition shrink-0 min-h-[44px] sm:min-h-0 flex items-center justify-center touch-manipulation"
        >
          Valorar ahora →
        </Link>
      </div>
    </div>
  );
}
