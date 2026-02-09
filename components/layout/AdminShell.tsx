"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  userDisplayName: string;
  children: React.ReactNode;
};

export default function AdminShell({ userDisplayName, children }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [viewSwitcherOpen, setViewSwitcherOpen] = useState(false);

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
            <Link href="/admin" className="flex items-center gap-3 min-w-0">
              <Image
                src="/logo-dili-panel.png"
                alt="Diligenz"
                width={48}
                height={48}
                className="h-12 w-12 object-contain shrink-0"
              />
              <span className="text-lg font-semibold truncate">Admin</span>
            </Link>
          ) : (
            <Link href="/admin" className="flex items-center justify-center w-full group">
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
            title={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            ☰
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
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl ${collapsed ? "px-2 py-2" : "px-3 py-2"} text-white/90 hover:bg-white/10 transition`}
            title={collapsed ? "Panel usuario" : undefined}
          >
            <span className={collapsed ? "text-lg" : ""}>←</span>
            {!collapsed && <span>Panel usuario</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 bg-white/90 backdrop-blur border-b border-[var(--brand-primary)]/10 px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-4">
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
            <p className="text-base font-medium text-[var(--foreground)]">
              Hola, <span className="text-[var(--brand-primary)] font-semibold">{userDisplayName}</span>
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setViewSwitcherOpen((o) => !o)}
                className="rounded-xl border-2 border-[var(--brand-primary)]/30 px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition"
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
                className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
              >
                Volver al dashboard
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
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
        active ? "bg-white/20 text-white font-medium" : "text-white/90 hover:bg-white/10"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed && active ? "text-lg" : ""}>{active ? "▸" : "◦"}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
