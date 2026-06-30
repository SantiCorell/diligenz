"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch, clearStoredToken } from "@/lib/auth-client";
import PageAmbient from "@/components/layout/PageAmbient";

type Props = {
  userDisplayName: string;
  children: React.ReactNode;
};

export default function AdminShell({ userDisplayName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [viewSwitcherOpen, setViewSwitcherOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        <div className={`panel-sidebar-header flex ${expanded ? "items-center justify-between gap-3 px-4 py-4" : "flex-col items-center gap-3 py-4 px-2"}`}>
          <div
            className="absolute inset-x-0 bottom-0 h-[3px] admin-card-bar"
            aria-hidden
          />
          <Link
            href="/admin"
            className={`flex min-w-0 items-center ${expanded ? "gap-2" : "justify-center"}`}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <Image
              src="/logo-diligenz-completo.png"
              alt="Diligenz"
              width={120}
              height={36}
              className={collapsed ? "h-7 w-auto object-contain" : "h-8 w-auto object-contain"}
            />
            {expanded && (
              <span className="text-sm font-semibold truncate text-[var(--brand-dark)]">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2.5 text-[var(--brand-dark)]/70 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-primary)] shrink-0 transition-colors md:block hidden"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
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
          <AdminNavLink
            href="/admin"
            label="Dashboard"
            collapsed={!expanded}
            active={pathname === "/admin"}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/sectors"
            label="Sectores"
            collapsed={!expanded}
            active={pathname.startsWith("/admin/sectors")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/companies"
            label="Empresas"
            collapsed={!expanded}
            active={pathname.startsWith("/admin/companies")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/actions"
            label="Acciones"
            collapsed={!expanded}
            active={pathname.startsWith("/admin/actions")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/leads"
            label="Leads"
            collapsed={!expanded}
            active={pathname.startsWith("/admin/leads")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/users"
            label="Usuarios"
            collapsed={!expanded}
            active={pathname.startsWith("/admin/users")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          {expanded && (
            <>
              <div className="panel-nav-divider" aria-hidden />
              <p className="panel-nav-section-label">Panel comprador</p>
            </>
          )}
          {!expanded && <div className="panel-nav-divider my-2" aria-hidden />}
          <AdminNavLink
            href="/dashboard/buyer"
            label="Inicio comprador"
            collapsed={!expanded}
            active={pathname.startsWith("/dashboard/buyer")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/dashboard/mis-empresas"
            label="Mis empresas"
            collapsed={!expanded}
            active={pathname.startsWith("/dashboard/mis-empresas")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/dashboard/profile"
            label="Mi perfil"
            collapsed={!expanded}
            active={pathname.startsWith("/dashboard/profile")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/companies"
            label="Explorar empresas"
            collapsed={!expanded}
            active={
              pathname === "/companies" ||
              (pathname.startsWith("/companies/") &&
                !pathname.startsWith("/companies/mi-interes"))
            }
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/"
            label="Ver web"
            collapsed={!expanded}
            active={false}
            noIcon
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </nav>

        <div className={`panel-sidebar-footer ${expanded ? "p-3" : "p-2"}`}>
          <Link
            href="/dashboard"
            className={`panel-nav-link ${expanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2"} text-[var(--brand-dark)]/75 hover:text-[var(--brand-primary)]`}
            title={!expanded ? "Panel usuario" : undefined}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <span className={!expanded ? "text-lg" : ""}>←</span>
            {expanded && <span>Panel usuario</span>}
          </Link>
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
            <p className="truncate text-sm font-medium text-[var(--brand-dark)] sm:text-base">
              Hola, <span className="font-semibold text-[var(--brand-primary)]">{userDisplayName}</span>
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setViewSwitcherOpen((o) => !o)}
                className="rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-surface)] px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/10"
              >
                Ver como…
              </button>
              {viewSwitcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setViewSwitcherOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-[var(--brand-primary)]/10 bg-white/95 py-2 shadow-xl backdrop-blur-md">
                    <Link
                      href="/dashboard/buyer"
                      className="block px-4 py-2.5 text-sm text-[var(--brand-dark)] hover:bg-[var(--brand-surface)]"
                      onClick={() => setViewSwitcherOpen(false)}
                    >
                      Ver como comprador
                    </Link>
                    <Link
                      href="/dashboard/seller"
                      className="block px-4 py-2.5 text-sm text-[var(--brand-dark)] hover:bg-[var(--brand-surface)]"
                      onClick={() => setViewSwitcherOpen(false)}
                    >
                      Ver como vendedor
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pathname !== "/admin" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-[var(--brand-dark)]/70 hover:text-[var(--brand-primary)]"
              >
                Volver al dashboard
              </Link>
            )}
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

function AdminNavLink({
  href,
  label,
  collapsed,
  active,
  noIcon,
  onNavigate,
}: {
  href: string;
  label: string;
  collapsed: boolean;
  active: boolean;
  noIcon?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`panel-nav-link ${collapsed ? "justify-center" : noIcon ? "" : "gap-3"} ${collapsed ? "px-2 py-2.5" : "px-3 py-2.5"} ${
        active
          ? "admin-nav-active text-[var(--brand-primary)] font-semibold"
          : "text-[var(--brand-dark)]/70"
      }`}
      title={collapsed ? label : undefined}
    >
      {!noIcon && (
        <span className={`panel-nav-icon ${active ? "panel-nav-icon--active" : ""}`}>
          {active ? "▸" : "◦"}
        </span>
      )}
      {!collapsed && <span>{label}</span>}
      {collapsed && noIcon && (
        <span className="text-[11px] font-semibold leading-tight">Web</span>
      )}
    </Link>
  );
}
