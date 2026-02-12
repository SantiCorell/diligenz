"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch, clearStoredToken } from "@/lib/auth-client";

export default function DashboardShell({
  children,
  role,
  userDisplayName,
}: {
  children: React.ReactNode;
  role: "BUYER" | "SELLER" | "ADMIN";
  userDisplayName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin viendo como comprador/vendedor: mostrar menú del rol que está simulando
  const effectiveRole: "BUYER" | "SELLER" | "ADMIN" =
    role === "ADMIN" && pathname.startsWith("/dashboard/buyer")
      ? "BUYER"
      : role === "ADMIN" && pathname.startsWith("/dashboard/seller")
      ? "SELLER"
      : role;

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
      <div className={`flex ${expanded ? "items-center justify-between gap-3 px-4 py-4" : "flex-col items-center gap-3 py-4 px-2"} border-b border-white/10`}>
        <Link
          href="/dashboard"
          className={`flex min-w-0 items-center ${expanded ? "gap-2" : "justify-center"}`}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <Image
            src="/icon-diligenz-claro.png"
            alt="Diligenz"
            width={44}
            height={44}
            className={expanded ? "h-10 w-10 object-contain" : "h-9 w-9 object-contain"}
          />
          {expanded && (
            <span className="text-sm font-semibold truncate text-white/90">Panel</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2.5 text-white/90 hover:bg-white/10 hover:text-white shrink-0 transition-colors md:block hidden"
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
          className="md:hidden rounded-lg p-2.5 text-white/90 hover:bg-white/10 shrink-0"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <nav className={`${expanded ? "mt-4 px-3" : "mt-2 px-2"} space-y-1 text-sm flex-1`}>
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
        <NavItem
          href="/companies/mi-interes"
          label="De mi interés"
          active={pathname.startsWith("/companies/mi-interes")}
          collapsed={!expanded}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
        {effectiveRole === "BUYER" && (
          <>
            <NavItem
              href="/companies"
              label="Empresas"
              active={
                pathname === "/companies" ||
                (pathname.startsWith("/companies/") && !pathname.startsWith("/companies/mi-interes"))
              }
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/dashboard/favorites"
              label="Favoritas"
              active={pathname.startsWith("/dashboard/favorites")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/dashboard/interests"
              label="Solicitudes"
              active={pathname.startsWith("/dashboard/interests")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </>
        )}
        {effectiveRole === "SELLER" && (
          <>
            <NavItem
              href="/dashboard/seller"
              label="Mis proyectos"
              active={pathname.startsWith("/dashboard/seller")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
            <NavItem
              href="/sell"
              label="Valorar empresa"
              active={pathname.startsWith("/sell")}
              collapsed={!expanded}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </>
        )}
      </nav>

      <div className={`${expanded ? "p-3" : "p-2"} border-t border-white/10`}>
        <button
          type="button"
          onClick={() => { setMobileSidebarOpen(false); goToWeb(); }}
          className={`w-full flex items-center ${expanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2"} rounded-lg text-white/80 hover:bg-white/10 transition text-left`}
          title={!expanded ? "Volver al sitio" : undefined}
        >
          <span className={!expanded ? "text-lg" : ""}>←</span>
          {expanded && <span>Volver al sitio</span>}
        </button>
      </div>
    </>
  );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--brand-bg)]">
      {/* Sidebar móvil: overlay, siempre expandido */}
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

      {/* Main: en móvil ancho completo */}
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
            <span className="text-sm font-medium text-white truncate">
              {userDisplayName ? (
                <>Hola, <span className="font-semibold">{userDisplayName}</span></>
              ) : (
                <span className="opacity-80">Panel de usuario</span>
              )}
            </span>
            {role === "ADMIN" && effectiveRole !== "ADMIN" && (
              <Link
                href="/admin"
                className="text-xs font-medium text-white bg-white/10 px-2.5 py-1 rounded-lg hover:bg-white/20"
              >
                Vista como {effectiveRole === "BUYER" ? "comprador" : "vendedor"} · Volver a Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
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
      className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2 py-2.5" : "px-3 py-2.5"} transition ${
        active
          ? "bg-white/15 text-white font-medium"
          : "text-white/80 hover:bg-white/10"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed && active ? "text-lg" : ""}>{active ? "▸" : "◦"}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
