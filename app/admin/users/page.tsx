"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import type { UserAccountStatus, UserRole } from "@prisma/client";
import { authFetch } from "@/lib/auth-client";
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUSES,
  accountStatusBadgeClass,
} from "@/lib/user-admin-ui";
import { Search, SlidersHorizontal, UserPlus, Trash2, ChevronDown } from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  accountStatus: UserAccountStatus;
  createdAt: string;
  emailVerified: boolean;
  ndaSigned: boolean;
  dniVerified: boolean;
  profileVerifiedByAdmin: boolean;
  hasCompanyDocumentLinks: boolean;
};

function profileCompleteEffective(u: UserRow) {
  return Boolean(u.phone?.trim()) || u.profileVerifiedByAdmin;
}

function UserVerificationPanel({
  user,
  onSaved,
}: {
  user: UserRow;
  onSaved: () => void;
}) {
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);
  const [ndaSigned, setNdaSigned] = useState(user.ndaSigned);
  const [dniVerified, setDniVerified] = useState(user.dniVerified);
  const [profileVerifiedByAdmin, setProfileVerifiedByAdmin] = useState(
    user.profileVerifiedByAdmin
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setEmailVerified(user.emailVerified);
    setNdaSigned(user.ndaSigned);
    setDniVerified(user.dniVerified);
    setProfileVerifiedByAdmin(user.profileVerifiedByAdmin);
    setMsg(null);
  }, [user]);

  const save = useCallback(async () => {
    setMsg(null);
    setSaving(true);
    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailVerified,
          ndaSigned,
          dniVerified,
          profileVerifiedByAdmin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ type: "error", text: (data as { error?: string }).error ?? "Error al guardar" });
        setSaving(false);
        return;
      }
      setMsg({ type: "ok", text: "Guardado." });
      onSaved();
    } catch {
      setMsg({ type: "error", text: "Error de conexión." });
    }
    setSaving(false);
  }, [
    user.id,
    emailVerified,
    ndaSigned,
    dniVerified,
    profileVerifiedByAdmin,
    onSaved,
  ]);

  const effectiveProfile = Boolean(user.phone?.trim()) || profileVerifiedByAdmin;

  return (
    <div className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white px-4 py-5 sm:px-6">
      <p className="text-sm font-semibold text-[var(--brand-primary)] mb-1">
        Validación del perfil (dashboard)
      </p>
      <p className="text-xs text-slate-600 mb-4 max-w-2xl leading-relaxed">
        Coinciden con «Mi perfil» del usuario. «Perfil completo» también cuenta si tiene teléfono o marcas
        la validación admin.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={emailVerified}
            onChange={(e) => setEmailVerified(e.target.checked)}
            className="rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30"
          />
          <span>Email verificado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={ndaSigned}
            onChange={(e) => setNdaSigned(e.target.checked)}
            className="rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30"
          />
          <span>NDA firmado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={dniVerified}
            onChange={(e) => setDniVerified(e.target.checked)}
            className="rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30"
          />
          <span>DNI verificado</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={profileVerifiedByAdmin}
            onChange={(e) => setProfileVerifiedByAdmin(e.target.checked)}
            className="rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30"
          />
          <span>Perfil completo (validado por admin)</span>
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Vista previa «Perfil completo» en dashboard: {effectiveProfile ? "sí" : "no"}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition"
        >
          {saving ? "Guardando…" : "Guardar checks"}
        </button>
        {msg && (
          <span className={msg.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}

/** Comprador, vendedor, profesional y administrador (mismo conjunto que al crear usuario). */
const ROLES: UserRole[] = ["ADMIN", "BUYER", "SELLER", "PROFESSIONAL"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fEmail, setFEmail] = useState(false);
  const [fDni, setFDni] = useState(false);
  const [fNda, setFNda] = useState(false);
  const [fDocLinks, setFDocLinks] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createUserName, setCreateUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    const qt = q.trim();
    if (qt) p.set("q", qt);
    if (roleFilter) p.set("role", roleFilter);
    if (statusFilter) p.set("status", statusFilter);
    if (fEmail) p.set("emailVerified", "1");
    if (fDni) p.set("dniVerified", "1");
    if (fNda) p.set("ndaSigned", "1");
    if (fDocLinks) p.set("documentLinks", "1");

    try {
      const res = await authFetch(`/api/admin/users?${p.toString()}`);
      const data = await res.json();
      if (res.ok) {
        const list = (data.users ?? []) as UserRow[];
        setUsers(
          list.map((u) => ({
            ...u,
            emailVerified: Boolean(u.emailVerified),
            ndaSigned: Boolean(u.ndaSigned),
            dniVerified: Boolean(u.dniVerified),
            profileVerifiedByAdmin: Boolean(u.profileVerifiedByAdmin),
            hasCompanyDocumentLinks: Boolean(u.hasCompanyDocumentLinks),
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, statusFilter, fEmail, fDni, fNda, fDocLinks]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadUsers();
    }, q.trim() ? 320 : 0);
    return () => clearTimeout(t);
  }, [loadUsers, q]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await authFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          phone: phone || undefined,
          role,
          name: createUserName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al crear el usuario." });
        setSubmitting(false);
        return;
      }
      setMessage({ type: "ok", text: `Usuario ${data.user?.email ?? email} creado correctamente.` });
      setEmail("");
      setPassword("");
      setCreateUserName("");
      setPhone("");
      setRole("ADMIN");
      loadUsers();
    } catch {
      setMessage({ type: "error", text: "Error de conexión." });
    }
    setSubmitting(false);
  };

  const updateAccountStatus = async (userId: string, accountStatus: UserAccountStatus) => {
    const res = await authFetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountStatus }),
    });
    if (res.ok) loadUsers();
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const res = await authFetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert((data as { error?: string }).error ?? "No se pudo cambiar el rol.");
    }
    loadUsers();
  };

  const deleteUser = async (u: UserRow) => {
    if (
      !confirm(
        `¿Eliminar definitivamente a ${u.name?.trim() || u.email}?\n\n` +
          "Se cerrará su sesión y el email quedará libre para dar de alta otro usuario."
      )
    ) {
      return;
    }
    const res = await authFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert((data as { error?: string }).error || "No se pudo eliminar.");
      return;
    }
    setExpandedUserId(null);
    loadUsers();
  };

  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <header className="mb-8 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]/70 mb-2">
          Administración
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Usuarios registrados
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Gestiona roles, estado de cuenta y verificación. Filtra por nombre, email, rol, estado o criterios
          de documentación. Los usuarios eliminados desaparecen del listado y pueden volver a registrarse con
          el mismo email.
        </p>
      </header>

      {/* Filtros */}
      <section className="mb-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <SlidersHorizontal className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden />
          <h2 className="text-sm font-semibold text-slate-800">Filtros</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre o email</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar…"
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
            >
              <option value="">Todos los roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ADMIN_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
            >
              <option value="">Todos los estados</option>
              {ACCOUNT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ADMIN_ACCOUNT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-5 pb-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-500 w-full sm:w-auto">Verificación</span>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={fEmail}
              onChange={(e) => setFEmail(e.target.checked)}
              className="rounded border-slate-300 text-[var(--brand-primary)]"
            />
            Mail verificado
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={fDni}
              onChange={(e) => setFDni(e.target.checked)}
              className="rounded border-slate-300 text-[var(--brand-primary)]"
            />
            DNI verificado
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={fNda}
              onChange={(e) => setFNda(e.target.checked)}
              className="rounded border-slate-300 text-[var(--brand-primary)]"
            />
            NDA firmado
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={fDocLinks}
              onChange={(e) => setFDocLinks(e.target.checked)}
              className="rounded border-slate-300 text-[var(--brand-primary)]"
            />
            Enlace documentos (empresa)
          </label>
        </div>
      </section>

      {/* Crear usuario */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold text-slate-900">Crear usuario</h2>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="new-name" className="block text-xs font-medium text-slate-600 mb-1">
              Nombre completo (opcional)
            </label>
            <input
              id="new-name"
              type="text"
              autoComplete="name"
              maxLength={200}
              value={createUserName}
              onChange={(e) => setCreateUserName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
              placeholder="Nombre y apellidos"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="new-email" className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
              placeholder="correo@empresa.com"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-slate-600 mb-1">
              Contraseña
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
              placeholder="Mín. 8 caracteres"
            />
          </div>
          <div>
            <label htmlFor="new-role" className="block text-xs font-medium text-slate-600 mb-1">
              Rol
            </label>
            <select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ADMIN_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="new-phone" className="block text-xs font-medium text-slate-600 mb-1">
              Teléfono (opcional)
            </label>
            <input
              id="new-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/15 focus:outline-none"
              placeholder="+34 …"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-6 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-6 py-3 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 disabled:opacity-50 transition"
            >
              {submitting ? "Creando…" : "Crear usuario"}
            </button>
            {message && (
              <span
                className={
                  message.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"
                }
              >
                {message.text}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Tabla */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
          <h2 className="text-sm font-semibold text-slate-800">Listado</h2>
          {loading && (
            <span className="text-xs text-slate-500 animate-pulse">Actualizando…</span>
          )}
        </div>
        {users.length === 0 && !loading ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            No hay usuarios con estos filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Mail
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Rol
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide min-w-[11rem]">
                    Estado
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                    Checks
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const checksOk =
                    [u.emailVerified, u.ndaSigned, u.dniVerified, profileCompleteEffective(u)].filter(
                      Boolean
                    ).length;
                  const displayName = u.name?.trim() || "—";

                  return (
                    <Fragment key={u.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-slate-900 font-medium max-w-[10rem] truncate" title={displayName}>
                          {displayName}
                        </td>
                        <td className="px-4 py-3.5">
                          <a
                            href={`mailto:${u.email}`}
                            className="text-[var(--brand-primary)] hover:underline font-medium break-all"
                          >
                            {u.email}
                          </a>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="relative inline-flex items-center min-w-[10.5rem]">
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                              className={`appearance-none cursor-pointer w-full rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-semibold border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/25 ${
                                u.role === "ADMIN"
                                  ? "bg-violet-100 text-violet-900"
                                  : u.role === "PROFESSIONAL"
                                  ? "bg-indigo-100 text-indigo-900"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                              aria-label="Rol del usuario"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ADMIN_ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="relative inline-flex items-center">
                            <select
                              value={u.accountStatus}
                              onChange={(e) =>
                                updateAccountStatus(u.id, e.target.value as UserAccountStatus)
                              }
                              className={`appearance-none cursor-pointer rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/25 ${accountStatusBadgeClass(u.accountStatus)}`}
                              aria-label="Estado de cuenta"
                            >
                              {ACCOUNT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {ADMIN_ACCOUNT_STATUS_LABELS[s]}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpandedUserId((id) => (id === u.id ? null : u.id))}
                            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                          >
                            {checksOk}/4 · {expandedUserId === u.id ? "Cerrar" : "Editar"}
                          </button>
                          {u.hasCompanyDocumentLinks && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
                              Docs
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => deleteUser(u)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                      {expandedUserId === u.id && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={6} className="p-0">
                            <UserVerificationPanel user={u} onSaved={loadUsers} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {admins.length > 0 && (
        <p className="mt-6 text-xs text-slate-500">
          {admins.length} administrador{admins.length !== 1 ? "es" : ""} en el resultado actual.
        </p>
      )}
    </main>
  );
}
