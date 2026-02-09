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
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-[var(--brand-primary)] text-white transition-all duration-200 flex flex-col`}
      >
        <div className={`flex ${collapsed ? "flex-col items-center gap-4 py-5 px-2" : "items-center justify-between gap-2 px-4 py-5"} border-b border-white/10`}>
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
              <Image
                src="/logo-dili-panel.png"
                alt="Diligenz"
                width={48}
                height={48}
                className="h-12 w-12 object-contain shrink-0"
              />
              <span className="text-lg font-semibold truncate">Panel</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full group">
              <div className="rounded-xl bg-white/95 p-3.5 shadow-lg group-hover:bg-white group-hover:shadow-xl transition-all">
                <Image
                  src="/logo-dili-panel.png"
                  alt="Diligenz"
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain"
                />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-lg p-2.5 hover:bg-white/10 shrink-0 text-white transition-all ${collapsed ? "border-2 border-white/30 hover:border-white/50" : ""}`}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            ☰
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
        <header className="flex items-center justify-between gap-4 bg-white/90 backdrop-blur border-b border-[var(--brand-primary)]/10 px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="rounded-lg p-2 hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] transition-all border-2 border-[var(--brand-primary)]/30 hover:border-[var(--brand-primary)]/50"
                aria-label="Expandir menú"
                title="Expandir menú lateral"
              >
                ☰
              </button>
            )}
            <span className="text-sm font-medium text-[var(--foreground)]">
              {userDisplayName ? (
                <>Hola, <span className="text-[var(--brand-primary)] font-semibold">{userDisplayName}</span></>
              ) : (
                <span className="opacity-80">Panel de usuario</span>
              )}
            </span>
            {role === "ADMIN" && effectiveRole !== "ADMIN" && (
              <Link
                href="/admin"
                className="text-xs font-medium text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-lg hover:bg-[var(--brand-primary)]/20"
              >
                Vista como {effectiveRole === "BUYER" ? "comprador" : "vendedor"} · Volver a Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {collapsed && (
              <Link
                href={effectiveRole === "ADMIN" ? "/admin" : `/dashboard/${effectiveRole.toLowerCase()}`}
                className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
              >
                Volver al panel
              </Link>
            )}
            <button
              onClick={logout}
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
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
          ? "bg-white/20 text-white font-medium"
          : "text-white/90 hover:bg-white/10"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed && active ? "text-lg" : ""}>{active ? "▸" : "◦"}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
