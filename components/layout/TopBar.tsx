import Link from "next/link";

export default function TopBar() {
  return (
    <div className="bg-orange-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <p className="text-orange-900 font-medium text-center sm:text-left">
          <span className="sm:hidden">💡 Valoración gratis · Sin registro</span>
          <span className="hidden sm:inline">💡 Valora tu empresa gratis en 2 minutos · Sin registro obligatorio</span>
        </p>
        <Link
          href="/sell"
          className="rounded-full bg-orange-500 px-4 py-1.5 text-white font-medium hover:bg-orange-600 transition shrink-0"
        >
          Valorar ahora →
        </Link>
      </div>
    </div>
  );
}
