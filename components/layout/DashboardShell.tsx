"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch, clearStoredToken } from "@/lib/auth-client";
import PageAmbient from "@/components/layout/PageAmbient";

/** Rutas de experiencia comprador: el admin debe ver el menú completo del comprador (no solo «Dashboard» → /admin). */
function pathnameIsBuyerPanel(path: string): boolean {
  if (path.startsWith("/dashboard/buyer")) return true;
  if (path.startsWith("/dashboard/mis-empresas")) return true;
  if (path.startsWith("/dashboard/profile")) return true;
  return false;
}

export default function DashboardShell({
  children,
  role,
  userDisplayName,
}: {
  children: React.ReactNode;
  role: "BUYER" | "SELLER" | "ADMIN" | "PROFESSIONAL";
  userDisplayName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin viendo como comprador/vendedor: simular ese rol. Profesional: menú dual (inversor + vendedor) en el nav.
  const effectiveRole: "BUYER" | "SELLER" | "ADMIN" =
    role === "ADMIN" && pathnameIsBuyerPanel(pathname)
      ? "BUYER"
      : role === "ADMIN" && pathname.startsWith("/dashboard/seller")
      ? "SELLER"
      : role === "ADMIN"
      ? "ADMIN"
      : role === "BUYER"
      ? "BUYER"
      : role === "SELLER"
      ? "SELLER"
      : "BUYER";

  const showAdminNavInUserPanel = role === "ADMIN" && effectiveRole !== "ADMIN";

  const logout = async () => {
    await authFetch("/api/auth/logout", { method: "POST" });
    clearStoredToken();
    router.push("/login");
    router.refresh();
  };

  const goToWeb = async () => {
    await authFetch("/api/auth/session");
    window.location.href = "/";
  };

  const renderSidebar = (forMobile = false) => {
    const expanded = forMobile ? true : !collapsed;
    return (
    <>
      <div className={`panel-sidebar-header flex ${expanded ? "items-center justify-between gap-3 px-4 py-4" : "flex-col items-center gap-3 py-4 px-2"}`}>
        <div className="absolute inset-x-0 bottom-0 h-[3px] admin-card-bar" aria-hidden />
        <Link
          href="/dashboard"
          className={`flex min-w-0 items-center ${expanded ? "gap-2" : "justify-center"}`}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <Image
            src="/logo-diligenz-completo.png"
            alt="Diligenz"
            width={120}
            height={36}
            className={expanded ? "h-8 w-auto object-contain" : "h-7 w-auto object-contain"}
          />
          {expanded && (
            <span className="text-sm font-semibold truncate text-[var(--brand-dark)]">Panel</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2.5 text-[var(--brand-dark)]/70 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-primary)] shrink-0 transition-colors md:block hidden"
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden rounded-lg p-2.5 text-[var(--brand-dark)]/70 hover:bg-[var(--brand-surface)] shrink-0"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <nav className={`${expanded ? "mt-4 px-3" : "mt-2 px-2"} space-y-1 text-sm flex-1`}>
        {role === "PROFESSIONAL" ? (
          <>
            <NavItem
              href="/dashboard/profile"
              label="Mi perfil"
              active={pathname.startsWith("/dashboard/profile")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            {expanded && (
              <>
                <div className="panel-nav-divider" aria-hidden />
                <p className="panel-nav-section-label">Como inversor</p>
              </>
            )}
            <NavItem
              href="/dashboard/buyer"
              label="Panel inversor"
              active={pathname === "/dashboard/buyer"}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/dashboard/buyer/documents"
              label="Documentos (inversor)"
              active={pathname.startsWith("/dashboard/buyer/documents")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/companies"
              label="Explorar empresas"
              active={
                pathname === "/companies" ||
                (pathname.startsWith("/companies/") &&
                  !pathname.startsWith("/companies/mi-interes"))
              }
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/dashboard/mis-empresas"
              label="Solicitudes e intereses"
              active={pathname.startsWith("/dashboard/mis-empresas")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            {expanded && (
              <>
                <div className="panel-nav-divider" aria-hidden />
                <p className="panel-nav-section-label">Como vendedor</p>
              </>
            )}
            <NavItem
              href="/dashboard/seller"
              label="Mis empresas en venta"
              active={
                pathname.startsWith("/dashboard/seller") &&
                !pathname.startsWith("/dashboard/seller/documents")
              }
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/dashboard/seller/documents"
              label="Documentos (vendedor)"
              active={pathname.startsWith("/dashboard/seller/documents")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/sell"
              label="Subir empresa"
              active={pathname.startsWith("/sell")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </>
        ) : (
          <>
            <NavItem
              href={effectiveRole === "ADMIN" ? "/admin" : `/dashboard/${effectiveRole.toLowerCase()}`}
              label="Dashboard"
              active={
                effectiveRole === "ADMIN"
                  ? pathname.startsWith("/admin")
                  : pathname === `/dashboard/${effectiveRole.toLowerCase()}`
              }
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            {effectiveRole === "BUYER" && (
              <>
                <NavItem
                  href="/dashboard/profile"
                  label="Mi perfil"
                  active={pathname.startsWith("/dashboard/profile")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/dashboard/buyer/documents"
                  label="Mis documentos"
                  active={pathname.startsWith("/dashboard/buyer/documents")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/companies"
                  label="Explorar empresas"
                  active={
                    pathname === "/companies" ||
                    (pathname.startsWith("/companies/") &&
                      !pathname.startsWith("/companies/mi-interes"))
                  }
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/dashboard/mis-empresas"
                  label="Mis empresas"
                  active={pathname.startsWith("/dashboard/mis-empresas")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
              </>
            )}
            {effectiveRole === "SELLER" && (
              <>
                <NavItem
                  href="/dashboard/profile"
                  label="Mi perfil"
                  active={pathname.startsWith("/dashboard/profile")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/dashboard/seller/documents"
                  label="Mis documentos"
                  active={pathname.startsWith("/dashboard/seller/documents")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/dashboard/seller"
                  label="Mis empresas"
                  active={
                    pathname.startsWith("/dashboard/seller") &&
                    !pathname.startsWith("/dashboard/seller/documents")
                  }
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/sell"
                  label="Subir empresa"
                  active={pathname.startsWith("/sell")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
              </>
            )}
          </>
        )}
        {showAdminNavInUserPanel && (
          <div className={`${expanded ? "mt-2" : "mt-1"} space-y-1`}>
            <div className="panel-nav-divider" aria-hidden />
            {expanded && <p className="panel-nav-section-label">Administración</p>}
            <NavItem
              href="/admin"
              label="Admin · Inicio"
              active={pathname.startsWith("/admin")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/admin/companies"
              label="Admin · Empresas"
              active={pathname.startsWith("/admin/companies")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/admin/actions"
              label="Admin · Acciones"
              active={pathname.startsWith("/admin/actions")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/admin/leads"
              label="Admin · Leads"
              active={pathname.startsWith("/admin/leads")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/admin/users"
              label="Admin · Usuarios"
              active={pathname.startsWith("/admin/users")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        )}
      </nav>

      <div className={`panel-sidebar-footer ${expanded ? "p-3" : "p-2"}`}>
        <button
          type="button"
          onClick={() => { setMobileSidebarOpen(false); goToWeb(); }}
          className={`panel-nav-link w-full ${expanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2"} text-[var(--brand-dark)]/75 hover:text-[var(--brand-primary)] text-left`}
          title={!expanded ? "Ir a la web" : undefined}
        >
          <span className={!expanded ? "text-lg" : ""}>←</span>
          {expanded && <span>Ir a la web</span>}
        </button>
      </div>
    </>
  );
  };

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      <PageAmbient />
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="panel-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col md:hidden">
            {renderSidebar(true)}
          </aside>
        </>
      )}

      <aside
        className={`panel-sidebar relative z-20 hidden shrink-0 flex-col transition-all duration-200 md:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebar(false)}
      </aside>

      <div className="relative z-10 flex min-w-0 w-full flex-1 flex-col">
        <header className="panel-header sticky top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2.5 text-[var(--brand-dark)]/70 hover:bg-[var(--brand-surface)] md:hidden"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="truncate text-sm font-medium text-[var(--brand-dark)]">
              {userDisplayName ? (
                <>Hola, <span className="font-semibold text-[var(--brand-primary)]">{userDisplayName}</span></>
              ) : (
                <span className="opacity-80">Panel de usuario</span>
              )}
            </span>
            {role === "ADMIN" && effectiveRole !== "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-full bg-[var(--brand-surface)] px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
              >
                Vista como {effectiveRole === "BUYER" ? "comprador" : "vendedor"} · Volver a Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="text-sm font-medium text-[var(--brand-dark)]/70 hover:text-[var(--brand-primary)]"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="relative flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`panel-nav-link ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-2 py-2.5" : "px-3 py-2.5"} ${
        active
          ? "admin-nav-active text-[var(--brand-primary)] font-semibold"
          : "text-[var(--brand-dark)]/70"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={`panel-nav-icon ${active ? "panel-nav-icon--active" : ""}`}>
        {active ? "▸" : "◦"}
      </span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
