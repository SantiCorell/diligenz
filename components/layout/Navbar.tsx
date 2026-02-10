"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LayoutDashboard, Star, Globe, LogOut } from "lucide-react";

type SessionRole = "ADMIN" | "BUYER" | "SELLER" | null;

export default function Navbar() {
  const [inicioOpen, setInicioOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{ loggedIn: boolean; role: SessionRole }>({ loggedIn: false, role: null });

  const fetchSession = () => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSession({ loggedIn: d.loggedIn === true, role: d.role ?? null }))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Al volver a la pestaña, refrescar sesión para renovar la cookie (sliding session).
  // Así Panel → Web → volver al Panel no pide login de nuevo.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchSession();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const panelHref = session.role === "ADMIN" ? "/admin" : "/dashboard";
  const loggedIn = session.loggedIn;

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
              className="flex items-center shrink-0 hover:opacity-90 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/logo-diligenz-claro.png"
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
              className="relative group"
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
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-52 rounded-lg border border-white/20 bg-[var(--brand-primary)] py-2 shadow-xl">
                    <Link href="/" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10 rounded-t-lg">
                      Inicio
                    </Link>
                    <Link href="/sobre-nosotros" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10 rounded-b-lg">
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
              className="relative group"
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
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-52 rounded-lg border border-white/20 bg-[var(--brand-primary)] py-2 shadow-xl">
                    <Link href="/servicios" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10 rounded-t-lg">
                      Ver servicios
                    </Link>
                    <Link href="/servicios#pricing" className="block px-4 py-2 text-[var(--brand-bg)] hover:bg-white/10 rounded-b-lg">
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
                className="relative group"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-semibold text-[var(--brand-bg)] transition"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-controls="user-menu-desktop"
                  id="user-menu-button"
                >
                  <span>Mi Panel</span>
                  <span className="text-xs" aria-hidden>▼</span>
                </button>
                {userMenuOpen && (
                  <div id="user-menu-desktop" role="menu" aria-labelledby="user-menu-button" className="absolute right-0 top-full pt-2 min-w-[14rem]">
                    <div className="w-56 rounded-xl border border-white/20 bg-[var(--brand-primary)]/95 backdrop-blur py-1.5 shadow-xl shadow-black/20">
                      <Link href={panelHref} prefetch={false} className="flex items-center gap-3 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition rounded-lg mx-1.5 font-medium">
                        <LayoutDashboard className="w-4 h-4 shrink-0 opacity-90" />
                        <span>Mi Panel</span>
                      </Link>
                      <Link href="/companies/mi-interes" className="flex items-center gap-3 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition rounded-lg mx-1.5">
                        <Star className="w-4 h-4 shrink-0 opacity-90" />
                        <span>De mi interés</span>
                      </Link>
                      <div className="my-1.5 border-t border-white/15" role="separator" aria-hidden />
                      <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition rounded-lg mx-1.5">
                        <Globe className="w-4 h-4 shrink-0 opacity-90" />
                        <span>Volver a la web</span>
                      </Link>
                      <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-2.5 text-[var(--brand-bg)] hover:bg-white/10 transition rounded-lg mx-1.5">
                        <LogOut className="w-4 h-4 shrink-0 opacity-90" />
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
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/15">
            {loggedIn ? (
              <>
                <span className="py-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                  Mi Panel
                </span>
                <Link
                  href={panelHref}
                  prefetch={false}
                  className="flex items-center gap-3 py-2.5 pl-4 border-b border-white/10 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 opacity-90" />
                  Mi Panel
                </Link>
                <Link
                  href="/companies/mi-interes"
                  className="flex items-center gap-3 py-2.5 pl-4 border-b border-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star className="w-4 h-4 shrink-0 opacity-90" />
                  De mi interés
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 py-2.5 pl-4 border-b border-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Globe className="w-4 h-4 shrink-0 opacity-90" />
                  Volver a la web
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="flex items-center gap-3 py-3 pl-4 text-center rounded-xl border border-white/20 font-medium mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogOut className="w-4 h-4 shrink-0 opacity-90" />
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
