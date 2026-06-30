"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch, clearStoredToken } from "@/lib/auth-client";
import { SELL_DASHBOARD_PATH, SELLER_MIS_EMPRESAS_PATH, PROFESSIONAL_MIS_EMPRESAS_PATH } from "@/lib/companies-dashboard-path";
import PageAmbient from "@/components/layout/PageAmbient";

/** Rutas de experiencia comprador: el admin debe ver el menú completo del comprador (no solo «Dashboard» → /admin). */
function pathnameIsBuyerPanel(path: string): boolean {
  if (path.startsWith("/dashboard/buyer")) return true;
  if (path.startsWith("/dashboard/mis-empresas")) return true;
  if (path.startsWith("/dashboard/favorites")) return true;
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

  // Admin viendo como comprador/vendedor: simular ese rol en el menú lateral.
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

  const renderSidebar = (forMobile = false) => {
    const expanded = forMobile ? true : !collapsed;
    return (
    <>
      <div className={`panel-sidebar-header shrink-0 flex ${expanded ? "items-center justify-between gap-3 px-4 py-4" : "flex-col items-center gap-3 py-4 px-2"}`}>
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

      <nav
        className={`${expanded ? "mt-4 px-3 pb-4" : "mt-2 px-2 pb-3"} min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain text-sm`}
      >
        {role === "PROFESSIONAL" ? (
          <>
            <NavItem
              href="/dashboard/professional"
              label="Dashboard"
              active={pathname === "/dashboard/professional"}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/dashboard/profile"
              label="Mi perfil"
              active={pathname.startsWith("/dashboard/profile")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href={PROFESSIONAL_MIS_EMPRESAS_PATH}
              label="Mis empresas"
              active={
                pathname.startsWith(PROFESSIONAL_MIS_EMPRESAS_PATH) ||
                pathname.startsWith("/dashboard/seller/companies")
              }
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href={SELL_DASHBOARD_PATH}
              label="Subir empresa"
              active={pathname.startsWith(SELL_DASHBOARD_PATH)}
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
                  : effectiveRole === "SELLER"
                    ? pathname === "/dashboard/seller"
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
                  href="/dashboard/mis-empresas"
                  label="Mis empresas"
                  active={pathname.startsWith("/dashboard/mis-empresas")}
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href="/dashboard/favorites"
                  label="Mis favoritos"
                  active={pathname.startsWith("/dashboard/favorites")}
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
                  href={SELLER_MIS_EMPRESAS_PATH}
                  label="Mis empresas"
                  active={
                    pathname.startsWith(SELLER_MIS_EMPRESAS_PATH) ||
                    pathname.startsWith("/dashboard/seller/companies")
                  }
                  collapsed={!expanded}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
                <NavItem
                  href={SELL_DASHBOARD_PATH}
                  label="Subir empresa"
                  active={pathname.startsWith(SELL_DASHBOARD_PATH)}
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

        <div className={`panel-nav-divider ${expanded ? "mt-3 mb-2" : "mt-2 mb-1.5"}`} aria-hidden />
        <WebNavItem collapsed={!expanded} onNavigate={() => setMobileSidebarOpen(false)} />
      </nav>
    </>
  );
  };

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row md:items-start">
      <PageAmbient />
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            aria-hidden
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="panel-sidebar fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-64 flex-col overflow-hidden md:hidden">
            {renderSidebar(true)}
          </aside>
        </>
      )}

      <aside
        className={`panel-sidebar sticky top-0 z-20 hidden h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden transition-all duration-200 md:flex ${
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

function WebNavItem({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`panel-nav-link text-[var(--brand-dark)]/70 ${collapsed ? "justify-center" : ""} ${collapsed ? "px-2 py-2.5" : "px-3 py-2.5"}`}
      title={collapsed ? "Ver web" : undefined}
    >
      {collapsed ? (
        <span className="text-[11px] font-semibold leading-tight">Web</span>
      ) : (
        <span>Ver web</span>
      )}
    </Link>
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
