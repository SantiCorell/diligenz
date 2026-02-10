"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  userDisplayName: string;
  children: React.ReactNode;
};

export default function AdminShell({ userDisplayName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [viewSwitcherOpen, setViewSwitcherOpen] = useState(false);

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
            href="/admin"
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
              <span className="text-sm font-semibold truncate text-white/90">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2.5 text-white/90 hover:bg-white/10 hover:text-white shrink-0 transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className={`${collapsed ? "mt-2" : "mt-4"} space-y-1 ${collapsed ? "px-2" : "px-3"} text-sm flex-1`}>
          <AdminNavLink
            href="/admin"
            label="Dashboard"
            collapsed={collapsed}
            active={pathname === "/admin"}
          />
          <AdminNavLink
            href="/admin/companies"
            label="Empresas"
            collapsed={collapsed}
            active={pathname.startsWith("/admin/companies")}
          />
          <AdminNavLink
            href="/admin/actions"
            label="Acciones"
            collapsed={collapsed}
            active={pathname.startsWith("/admin/actions")}
          />
          <AdminNavLink
            href="/admin/leads"
            label="Leads"
            collapsed={collapsed}
            active={pathname.startsWith("/admin/leads")}
          />
          <AdminNavLink
            href="/admin/users"
            label="Usuarios"
            collapsed={collapsed}
            active={pathname.startsWith("/admin/users")}
          />
          <AdminNavLink
            href="/"
            label="Ver web"
            collapsed={collapsed}
            active={false}
          />
        </nav>

        <div className={`${collapsed ? "p-2" : "p-3"} border-t border-white/10`}>
          <Link
            href="/dashboard"
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2 py-2" : "px-3 py-2"} text-white/80 hover:bg-white/10 transition`}
            title={collapsed ? "Panel usuario" : undefined}
          >
            <span className={collapsed ? "text-lg" : ""}>←</span>
            {!collapsed && <span>Panel usuario</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 bg-[var(--brand-primary)] text-white border-b border-white/10 px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-4">
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
            <p className="text-base font-medium text-white">
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
}: {
  href: string;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
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
