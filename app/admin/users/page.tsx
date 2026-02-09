"use client";

import { useState, useEffect } from "react";

type UserRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  blocked: boolean;
  blockedUntil: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  BUYER: "Comprador",
  SELLER: "Vendedor",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "BUYER" | "SELLER">("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone: phone || undefined, role }),
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
      setPhone("");
      setRole("ADMIN");
      fetchUsers();
    } catch {
      setMessage({ type: "error", text: "Error de conexión." });
    }
    setSubmitting(false);
  };

  const handleBlockUser = async (userId: string, blocked: boolean, hours?: number) => {
    try {
      const res = await fetch("/api/admin/block-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, blocked, hours }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al bloquear/desbloquear usuario.");
        return;
      }
      fetchUsers();
    } catch {
      alert("Error de conexión.");
    }
  };

  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Usuarios
        </h1>
        <p className="mt-2 text-[var(--foreground)] opacity-80">
          Solo los administradores pueden crear nuevos usuarios. Aquí puedes dar de alta nuevos admins o usuarios comprador/vendedor.
        </p>
      </div>

      {/* Crear usuario */}
      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/20 bg-white p-6 shadow-lg mb-10">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)] border-b border-[var(--brand-primary)]/20 pb-3">
          Crear nuevo usuario
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="new-email" className="block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="nuevo@email.com"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-[var(--foreground)]">
              Contraseña (mín. 8 caracteres)
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="********"
            />
          </div>
          <div>
            <label htmlFor="new-role" className="block text-sm font-medium text-[var(--foreground)]">
              Rol
            </label>
            <select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "BUYER" | "SELLER")}
              className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
            >
              <option value="ADMIN">Administrador</option>
              <option value="BUYER">Comprador</option>
              <option value="SELLER">Vendedor</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-phone" className="block text-sm font-medium text-[var(--foreground)]">
              Teléfono (opcional)
            </label>
            <input
              id="new-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none"
              placeholder="+34 600 000 000"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? "Creando…" : "Crear usuario"}
            </button>
            {message && (
              <span
                className={
                  message.type === "ok"
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {message.text}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Listado de usuarios */}
      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white shadow-lg overflow-hidden">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)] border-b border-[var(--brand-primary)]/20 px-6 py-4">
          Usuarios registrados
        </h2>
        {loading ? (
          <div className="p-12 text-center text-[var(--foreground)] opacity-70">
            Cargando…
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-[var(--foreground)] opacity-80">
            No hay usuarios.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5">
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Rol
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Fecha alta
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isBlocked = u.blocked && (!u.blockedUntil || new Date(u.blockedUntil) > new Date());
                  const blockedUntilDate = u.blockedUntil ? new Date(u.blockedUntil) : null;
                  
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-[var(--brand-primary)]/10 hover:bg-[var(--brand-bg)]/50 ${
                        u.role === "ADMIN" ? "bg-[var(--brand-primary)]/5" : ""
                      } ${isBlocked ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-[var(--foreground)] font-medium">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            u.role === "ADMIN"
                              ? "rounded-full bg-[var(--brand-primary)]/20 px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)]"
                              : "text-[var(--foreground)] opacity-85"
                          }
                        >
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isBlocked ? (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            Bloqueado
                            {blockedUntilDate && (
                              <span className="block text-xs opacity-75 mt-0.5">
                                Hasta {blockedUntilDate.toLocaleDateString("es-ES")}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)] opacity-85">
                        {new Date(u.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {isBlocked ? (
                            <button
                              onClick={() => handleBlockUser(u.id, false)}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition"
                            >
                              Desbloquear
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Bloquear a ${u.email} por 1 hora?`)) {
                                    handleBlockUser(u.id, true, 1);
                                  }
                                }}
                                className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 transition"
                              >
                                1h
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Bloquear a ${u.email} por 24 horas?`)) {
                                    handleBlockUser(u.id, true, 24);
                                  }
                                }}
                                className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition"
                              >
                                24h
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Bloquear permanentemente a ${u.email}?`)) {
                                    handleBlockUser(u.id, true);
                                  }
                                }}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
                              >
                                Bloquear
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {admins.length > 0 && (
        <p className="mt-4 text-sm text-[var(--foreground)] opacity-75">
          Hay {admins.length} administrador{admins.length !== 1 ? "es" : ""} con acceso al panel de control.
        </p>
      )}
    </main>
  );
}
