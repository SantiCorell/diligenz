"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch, clearStoredToken } from "@/lib/auth-client";

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
        <div className={`flex ${expanded ? "items-center justify-between gap-3 px-4 py-4" : "flex-col items-center gap-3 py-4 px-2"} border-b border-white/10`}>
          <Link
            href="/admin"
            className={`flex min-w-0 items-center ${expanded ? "gap-2" : "justify-center"}`}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <Image
              src="/icon-diligenz-claro.png"
              alt="Diligenz"
              width={44}
              height={44}
              className={collapsed ? "h-9 w-9 object-contain" : "h-10 w-10 object-contain"}
            />
            {expanded && (
              <span className="text-sm font-semibold truncate text-white/90">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2.5 text-white/90 hover:bg-white/10 hover:text-white shrink-0 transition-colors md:block hidden"
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
            className="md:hidden rounded-lg p-2.5 text-white/90 hover:bg-white/10 shrink-0"
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
          <AdminNavLink
            href="/"
            label="Ver web"
            collapsed={!expanded}
            active={false}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </nav>

        <div className={`${expanded ? "p-3" : "p-2"} border-t border-white/10`}>
          <Link
            href="/dashboard"
            className={`flex items-center ${expanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2"} rounded-xl text-white/80 hover:bg-white/10 transition`}
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--brand-bg)]">
      {/* Sidebar móvil: overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--brand-primary)] text-white flex flex-col border-r border-white/10 md:hidden">
            {renderSidebar(true)}
          </aside>
        </>
      )}

      {/* Sidebar escritorio */}
      <aside
        className={`hidden md:flex ${
          collapsed ? "w-20" : "w-64"
        } bg-[var(--brand-primary)] text-white transition-all duration-200 flex-col border-r border-white/10 shrink-0`}
      >
        {renderSidebar(false)}
      </aside>

      {/* Main: en móvil ancho completo, no lo encoge el sidebar */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="flex items-center justify-between gap-4 bg-[var(--brand-primary)] text-white border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden rounded-lg p-2.5 text-white/90 hover:bg-white/10 shrink-0"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p className="text-sm sm:text-base font-medium text-white truncate">
              Hola, <span className="font-semibold">{userDisplayName}</span>
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setViewSwitcherOpen((o) => !o)}
                className="rounded-lg border border-white/25 px-3 py-2 text-sm font-medium text-white/95 hover:bg-white/10 transition"
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
                  <div className="absolute left-0 top-full mt-1 z-20 w-56 rounded-xl border border-[var(--brand-primary)]/20 bg-white py-2 shadow-xl">
                    <Link
                      href="/dashboard/buyer"
                      className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--brand-bg)]"
                      onClick={() => setViewSwitcherOpen(false)}
                    >
                      Ver como comprador
                    </Link>
                    <Link
                      href="/dashboard/seller"
                      className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--brand-bg)]"
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
                className="text-sm font-medium text-white/90 hover:text-white hover:underline"
              >
                Volver al dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="text-sm font-medium text-white/90 hover:text-white hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-[var(--brand-bg)]">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  collapsed,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2 py-2.5" : "px-3 py-2.5"} transition ${
        active ? "bg-white/15 text-white font-medium" : "text-white/80 hover:bg-white/10"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed && active ? "text-lg" : ""}>{active ? "▸" : "◦"}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
