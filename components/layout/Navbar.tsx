"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [inicioOpen, setInicioOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setLoggedIn(d.loggedIn === true))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-primary)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link
              href="/"
              className="flex items-center shrink-0 rounded-lg bg-white/95 px-3 py-1.5 hover:bg-white transition shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/logo-diligenz-completo.png"
                alt="Diligenz"
                width={140}
                height={40}
                className="h-7 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--brand-bg)]">
            <div
              className="relative pb-24 -mb-24"
              onMouseEnter={() => setInicioOpen(true)}
              onMouseLeave={() => setInicioOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:opacity-90"
              >
                Inicio
                <span className="text-xs">▼</span>
              </button>
              {inicioOpen && (
                <div className="absolute top-full left-0 w-52 -mt-px">
                  <div className="rounded-b-lg border border-t-0 border-white/20 bg-[var(--brand-primary)] py-2 shadow-xl">
                    <Link href="/" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10">
                      Inicio
                    </Link>
                    <Link href="/sobre-nosotros" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10">
                      Sobre nosotros
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/companies" className="hover:opacity-90">
              Empresas
            </Link>
            <div
              className="relative pb-24 -mb-24"
              onMouseEnter={() => setServiciosOpen(true)}
              onMouseLeave={() => setServiciosOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:opacity-90"
              >
                Servicios
                <span className="text-xs">▼</span>
              </button>
              {serviciosOpen && (
                <div className="absolute top-full left-0 w-52 -mt-px">
                  <div className="rounded-b-lg border border-t-0 border-white/20 bg-[var(--brand-primary)] py-2 shadow-xl">
                    <Link href="/servicios" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10">
                      Ver servicios
                    </Link>
                    <Link href="/servicios#pricing" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10">
                      Precios
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/sell" className="hover:opacity-90">
              Valorar / Vender
            </Link>
            <Link href="/blog" className="hover:opacity-90">
              Blog
            </Link>
            <Link href="/contact" className="hover:opacity-90">
              Contacto
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {loggedIn ? (
              <div
                className="relative pb-24 -mb-24"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-semibold text-[var(--brand-bg)] transition"
                >
                  <span>Mi Panel</span>
                  <span className="text-xs">▼</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full w-56 -mt-px">
                    <div className="rounded-b-lg border border-t-0 border-white/20 bg-[var(--brand-primary)] py-2 shadow-xl">
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition">
                        <span>📊</span>
                        <span>Mi Panel</span>
                      </Link>
                      <Link href="/companies/mi-interes" className="flex items-center gap-2 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition">
                        <span>⭐</span>
                        <span>De mi interés</span>
                      </Link>
                      <div className="border-t border-white/10 my-1"></div>
                      <Link href="/" className="flex items-center gap-2 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition">
                        <span>🌐</span>
                        <span>Volver a la web</span>
                      </Link>
                      <Link href="/api/auth/logout" className="flex items-center gap-2 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition">
                        <span>🚪</span>
                        <span>Cerrar sesión</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-[var(--brand-bg)] hover:opacity-90">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[var(--brand-bg)] px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:opacity-90 transition"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          {/* Hamburger: solo móvil */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg text-[var(--brand-bg)] hover:bg-white/10"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-1" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1.5 transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1.5 transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      <div
        className={`md:hidden absolute inset-x-0 top-full bg-[var(--brand-primary)] border-t border-white/10 shadow-xl overflow-y-auto transition-all duration-200 ${
          mobileMenuOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="px-6 py-4 pb-6 flex flex-col gap-1 text-[var(--brand-bg)]">
          <span className="py-2 text-xs font-semibold uppercase tracking-wider opacity-80">
            Inicio
          </span>
          <Link
            href="/"
            className="py-2.5 pl-4 border-b border-white/5"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href="/sobre-nosotros"
            className="py-2.5 pl-4 border-b border-white/10 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sobre nosotros
          </Link>
          <Link
            href="/companies"
            className="py-3 border-b border-white/10 font-medium mt-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            Empresas
          </Link>
          <span className="py-2 text-xs font-semibold uppercase tracking-wider opacity-80 mt-1">
            Servicios
          </span>
          <Link
            href="/servicios"
            className="py-2.5 pl-4 border-b border-white/5"
            onClick={() => setMobileMenuOpen(false)}
          >
            Ver servicios
          </Link>
          <Link
            href="/servicios#pricing"
            className="py-2.5 pl-4 border-b border-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Precios
          </Link>
          <Link
            href="/sell"
            className="py-3 border-b border-white/10 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Valorar / Vender
          </Link>
          <Link
            href="/blog"
            className="py-3 border-b border-white/10 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="py-3 border-b border-white/10 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contacto
          </Link>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
            {loggedIn ? (
              <>
                <span className="py-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                  Mi Panel
                </span>
                <Link
                  href="/dashboard"
                  className="py-2.5 pl-4 border-b border-white/10 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 Mi Panel
                </Link>
                <Link
                  href="/companies/mi-interes"
                  className="py-2.5 pl-4 border-b border-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⭐ De mi interés
                </Link>
                <Link
                  href="/"
                  className="py-2.5 pl-4 border-b border-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🌐 Volver a la web
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="py-3 text-center rounded-xl border-2 border-white/30 font-medium mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cerrar sesión
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-3 text-center rounded-xl border-2 border-white/30 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="py-3 text-center rounded-xl bg-[var(--brand-bg)] text-[var(--brand-primary)] font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
