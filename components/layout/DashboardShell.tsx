"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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

  // Admin viendo como comprador/vendedor: mostrar menú del rol que está simulando
  const effectiveRole: "BUYER" | "SELLER" | "ADMIN" =
    role === "ADMIN" && pathname.startsWith("/dashboard/buyer")
      ? "BUYER"
      : role === "ADMIN" && pathname.startsWith("/dashboard/seller")
      ? "SELLER"
      : role;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)]">
      {/* Sidebar: fondo marca Diligenz para que el logo blanco se vea */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-[var(--brand-primary)] text-white transition-all duration-200 flex flex-col border-r border-white/10`}
      >
        <div className={`flex ${collapsed ? "flex-col items-center gap-3 py-4 px-2" : "items-center justify-between gap-3 px-4 py-4"} border-b border-white/10`}>
          <Link
            href="/dashboard"
            className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-2"}`}
          >
            <Image
              src="/logo-dili.png"
              alt="Diligenz"
              width={140}
              height={44}
              className={collapsed ? "h-9 w-auto object-contain" : "h-10 w-auto object-contain"}
            />
            {!collapsed && (
              <span className="text-sm font-semibold truncate text-white/90">Panel</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2.5 text-white/90 hover:bg-white/10 hover:text-white shrink-0 transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className={`${collapsed ? "mt-2" : "mt-4"} space-y-1 ${collapsed ? "px-2" : "px-3"} text-sm flex-1`}>
          <NavItem
            href={effectiveRole === "ADMIN" ? "/admin" : `/dashboard/${effectiveRole.toLowerCase()}`}
            label="Dashboard"
            active={
              effectiveRole === "ADMIN"
                ? pathname.startsWith("/admin")
                : pathname === `/dashboard/${effectiveRole.toLowerCase()}`
            }
            collapsed={collapsed}
          />

          <NavItem
            href="/companies/mi-interes"
            label="De mi interés"
            active={pathname.startsWith("/companies/mi-interes")}
            collapsed={collapsed}
          />

          {effectiveRole === "BUYER" && (
            <>
              <NavItem
                href="/companies"
                label="Empresas"
                active={
                  pathname === "/companies" ||
                  (pathname.startsWith("/companies/") &&
                    !pathname.startsWith("/companies/mi-interes"))
                }
                collapsed={collapsed}
              />
              <NavItem
                href="/dashboard/favorites"
                label="Favoritas"
                active={pathname.startsWith("/dashboard/favorites")}
                collapsed={collapsed}
              />
              <NavItem
                href="/dashboard/interests"
                label="Solicitudes"
                active={pathname.startsWith("/dashboard/interests")}
                collapsed={collapsed}
              />
            </>
          )}

          {effectiveRole === "SELLER" && (
            <>
              <NavItem
                href="/dashboard/seller"
                label="Mis proyectos"
                active={pathname.startsWith("/dashboard/seller")}
                collapsed={collapsed}
              />
              <NavItem
                href="/sell"
                label="Valorar empresa"
                active={pathname.startsWith("/sell")}
                collapsed={collapsed}
              />
            </>
          )}
        </nav>

        <div className={`${collapsed ? "p-2" : "p-3"} border-t border-white/10`}>
          <Link
            href="/"
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-lg ${collapsed ? "px-2 py-2" : "px-3 py-2"} text-white/80 hover:bg-white/10 transition`}
            title={collapsed ? "Volver al sitio" : undefined}
          >
            <span className={collapsed ? "text-lg" : ""}>←</span>
            {!collapsed && <span>Volver al sitio</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 bg-[var(--brand-primary)] text-white border-b border-white/10 px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Expandir menú"
                title="Expandir menú lateral"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <span className="text-sm font-medium text-white">
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
            {collapsed && (
              <Link
                href={effectiveRole === "ADMIN" ? "/admin" : `/dashboard/${effectiveRole.toLowerCase()}`}
                className="text-sm font-medium text-white/90 hover:text-white hover:underline"
              >
                Volver al panel
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

function NavItem({
  href,
  label,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
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
