"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LayoutDashboard, Star, Globe, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { authFetch, clearStoredToken, syncSessionCookie } from "@/lib/auth-client";
import LoginModal from "@/components/auth/LoginModal";
import RegisterFormModal from "@/components/auth/RegisterFormModal";

type SessionRole = "ADMIN" | "BUYER" | "SELLER" | null;

export default function Navbar() {
  const [inicioOpen, setInicioOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileInicioOpen, setMobileInicioOpen] = useState(false);
  const [mobileServiciosOpen, setMobileServiciosOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [session, setSession] = useState<{ loggedIn: boolean; role: SessionRole }>({ loggedIn: false, role: null });

  const fetchSession = () => {
    authFetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        setSession({ loggedIn: d.loggedIn === true, role: d.role ?? null });
        if (d.loggedIn) syncSessionCookie();
      })
      .catch(() => {});
  };

  useEffect(() => {
    syncSessionCookie();
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

  const handleLogout = async () => {
    await authFetch("/api/auth/logout", { method: "POST" });
    clearStoredToken();
    window.location.href = "/";
  };

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else {
      document.body.style.overflow = "";
      setMobileInicioOpen(false);
      setMobileServiciosOpen(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-primary)] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          <Link
              href="/"
              className="flex items-center shrink-0 hover:opacity-90 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image
                src="/logo-diligenz-claro.png"
                alt="Diligenz"
                width={120}
                height={36}
                className="h-6 sm:h-8 w-auto object-contain"
                priority
              />
            </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-white">
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
                  <div className="w-52 rounded-xl border border-white/20 bg-[var(--brand-primary)] py-1.5 shadow-xl overflow-hidden">
                    <Link href="/" className="block px-4 py-2.5 text-white hover:bg-white/10">
                      Inicio
                    </Link>
                    <Link href="/sobre-nosotros" className="block px-4 py-2.5 text-white hover:bg-white/10">
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
                  <div className="w-52 rounded-xl border border-white/20 bg-[var(--brand-primary)] py-1.5 shadow-xl overflow-hidden">
                    <Link href="/servicios" className="block px-4 py-2.5 text-white hover:bg-white/10">
                      Ver servicios
                    </Link>
                    <Link href="/servicios#pricing" className="block px-4 py-2.5 text-white hover:bg-white/10">
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
                  className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-sm font-semibold text-white transition"
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
                      <Link href={panelHref} prefetch={false} className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/10 transition rounded-lg mx-1.5 font-medium">
                        <LayoutDashboard className="w-4 h-4 shrink-0 opacity-90" />
                        <span>Mi Panel</span>
                      </Link>
                      <Link href="/companies/mi-interes" className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/10 transition rounded-lg mx-1.5">
                        <Star className="w-4 h-4 shrink-0 opacity-90" />
                        <span>De mi interés</span>
                      </Link>
                      <div className="my-1.5 border-t border-white/15" role="separator" aria-hidden />
                      <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/10 transition rounded-lg mx-1.5">
                        <Globe className="w-4 h-4 shrink-0 opacity-90" />
                        <span>Volver a la web</span>
                      </Link>
                      <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-white/10 transition rounded-lg mx-1.5 w-full text-left">
                        <LogOut className="w-4 h-4 shrink-0 opacity-90" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white hover:opacity-90">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-white px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          {/* Hamburger: solo móvil */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg text-white hover:bg-white/10"
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

      {/* Menú móvil: Inicio y Servicios desplegables; solo se ven las líneas principales + botones */}
      <div
        className={`md:hidden absolute inset-x-0 top-full bg-[var(--brand-primary)] border-t border-white/10 shadow-xl overflow-y-auto transition-all duration-200 rounded-b-2xl ${
          mobileMenuOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="px-6 py-4 pb-6 flex flex-col text-white">
          {/* Inicio (desplegable) */}
          <div className="border-b border-white/10">
            <button
              type="button"
              onClick={() => setMobileInicioOpen((o) => !o)}
              className="flex items-center justify-between w-full py-3 font-medium"
              aria-expanded={mobileInicioOpen}
            >
              Inicio
              <span className="shrink-0 ml-2">
                {mobileInicioOpen ? <ChevronUp className="w-5 h-5 opacity-80" /> : <ChevronDown className="w-5 h-5 opacity-80" />}
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${mobileInicioOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
              <Link href="/" className="block py-2 pl-4 text-white/95 hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <Link href="/sobre-nosotros" className="block py-2 pl-4 text-white/95 hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Sobre nosotros
              </Link>
            </div>
          </div>

          {/* Empresas */}
          <Link href="/companies" className="py-3 font-medium border-b border-white/10 block" onClick={() => setMobileMenuOpen(false)}>
            Empresas
          </Link>

          {/* Servicios (desplegable) */}
          <div className="border-b border-white/10">
            <button
              type="button"
              onClick={() => setMobileServiciosOpen((o) => !o)}
              className="flex items-center justify-between w-full py-3 font-medium"
              aria-expanded={mobileServiciosOpen}
            >
              Servicios
              <span className="shrink-0 ml-2">
                {mobileServiciosOpen ? <ChevronUp className="w-5 h-5 opacity-80" /> : <ChevronDown className="w-5 h-5 opacity-80" />}
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${mobileServiciosOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
              <Link href="/servicios" className="block py-2 pl-4 text-white/95 hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Ver servicios
              </Link>
              <Link href="/servicios#pricing" className="block py-2 pl-4 text-white/95 hover:bg-white/10 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Precios
              </Link>
            </div>
          </div>

          {/* Valorar / Vender, Blog, Contacto */}
          <Link href="/sell" className="py-3 font-medium border-b border-white/10 block" onClick={() => setMobileMenuOpen(false)}>
            Valorar / Vender
          </Link>
          <Link href="/blog" className="py-3 font-medium border-b border-white/10 block" onClick={() => setMobileMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/contact" className="py-3 font-medium border-b border-white/10 block" onClick={() => setMobileMenuOpen(false)}>
            Contacto
          </Link>

          {/* Botones: Iniciar sesión / Crear cuenta o Mi Panel */}
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
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 py-3 pl-4 text-center rounded-xl border border-white/20 font-medium mt-2 w-full text-white"
                >
                  <LogOut className="w-4 h-4 shrink-0 opacity-90" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="py-3 text-center rounded-xl border-2 border-white/30 font-medium w-full text-white"
                  onClick={() => { setMobileMenuOpen(false); setLoginModalOpen(true); }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="py-3 text-center rounded-xl border-2 border-white text-white font-medium hover:bg-white/10 transition w-full"
                  onClick={() => { setMobileMenuOpen(false); setRegisterModalOpen(true); }}
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Modales de login y registro (móvil: carta con logo y formulario) */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenRegister={() => { setLoginModalOpen(false); setRegisterModalOpen(true); }}
        onSuccess={fetchSession}
      />
      <RegisterFormModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onOpenLogin={() => { setRegisterModalOpen(false); setLoginModalOpen(true); }}
        onSuccess={fetchSession}
      />
    </header>
  );
}
