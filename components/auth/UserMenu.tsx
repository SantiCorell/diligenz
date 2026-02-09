"use client";

import Link from "next/link";
import UserMenu from "@/components/auth/UserMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          DILIGENZ
        </Link>

        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          <Link href="/companies">Empresas</Link>
          <Link href="/valuation">Valorar empresa</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contacto</Link>
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
