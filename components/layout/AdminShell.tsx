"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Globe,
  Inbox,
  Layers,
  LayoutGrid,
  ListChecks,
  Search,
  User,
  Users,
} from "lucide-react";
import { authFetch, clearStoredToken } from "@/lib/auth-client";

type Props = {
  userDisplayName: string;
  children: React.ReactNode;
};

export default function AdminShell({ userDisplayName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = false;
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
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden rounded-lg p-2.5 text-[var(--brand-dark)]/70 hover:bg-[var(--brand-surface)] shrink-0"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className={`${expanded ? "mt-2 px-3 pb-4" : "mt-2 px-2 pb-3"} min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain text-sm`}>
          {expanded && <p className="panel-nav-section-label">Panel admin</p>}
          <AdminNavLink
            href="/admin"
            label="Dashboard"
            icon={LayoutGrid}
            collapsed={!expanded}
            active={pathname === "/admin"}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/sectors"
            label="Sectores"
            icon={Layers}
            collapsed={!expanded}
            active={pathname.startsWith("/admin/sectors")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/companies"
            label="Empresas"
            icon={Building2}
            collapsed={!expanded}
            active={pathname.startsWith("/admin/companies")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/actions"
            label="Acciones"
            icon={ListChecks}
            collapsed={!expanded}
            active={pathname.startsWith("/admin/actions")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/leads"
            label="Leads"
            icon={Inbox}
            collapsed={!expanded}
            active={pathname.startsWith("/admin/leads")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/admin/users"
            label="Usuarios"
            icon={Users}
            collapsed={!expanded}
            active={pathname.startsWith("/admin/users")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          {expanded && (
            <p className="panel-nav-section-label mt-4">
              Panel comprador <span className="normal-case tracking-normal">· vista previa</span>
            </p>
          )}
          {!expanded && <div className="panel-nav-divider my-2" aria-hidden />}
          <AdminNavLink
            href="/dashboard/buyer"
            label="Inicio comprador"
            icon={LayoutGrid}
            collapsed={!expanded}
            active={pathname.startsWith("/dashboard/buyer")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/dashboard/mis-empresas"
            label="Mis empresas"
            icon={Briefcase}
            collapsed={!expanded}
            active={pathname.startsWith("/dashboard/mis-empresas")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/dashboard/profile"
            label="Mi perfil"
            icon={User}
            collapsed={!expanded}
            active={pathname.startsWith("/dashboard/profile")}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
          <AdminNavLink
            href="/companies"
            label="Explorar empresas"
            icon={Search}
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
            icon={Globe}
            collapsed={!expanded}
            active={false}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </nav>
    </>
  );
  };

  return (
    <div className="admin-shell relative flex min-h-screen flex-col">
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
        className={`panel-sidebar fixed inset-y-0 left-0 z-20 hidden h-[100dvh] max-h-[100dvh] flex-col overflow-hidden transition-all duration-200 md:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebar(false)}
      </aside>

      <div
        className={`relative z-10 flex min-w-0 w-full flex-1 flex-col transition-[padding] duration-200 ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
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
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setViewSwitcherOpen((o) => !o)}
                className="rounded-full border border-[var(--brand-primary)]/35 bg-white px-3.5 py-1.5 text-sm font-medium text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)]/5"
              >
                Ver como comprador
              </button>
              {viewSwitcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setViewSwitcherOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-[var(--brand-primary)]/10 bg-white py-2 shadow-xl">
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

        <main className="admin-canvas relative flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`panel-nav-link gap-3 ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"} ${
        active
          ? "admin-nav-active text-[var(--brand-primary)] font-semibold"
          : "text-[var(--brand-dark)]/70"
      }`}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
