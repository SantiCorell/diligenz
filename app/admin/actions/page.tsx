"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/auth-client";

type ActionRow = {
  id: string;
  userEmail: string;
  companyId: string;
  companyName: string;
  status: string;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  MANAGED: "Gestionada",
  REJECTED: "Rechazada",
};

export default function AdminActionsPage() {
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const fetchActions = async () => {
    setLoading(true);
    const url = filter ? `/api/admin/actions?status=${filter}` : "/api/admin/actions";
    const res = await authFetch(url);
    const data = await res.json();
    if (res.ok) setActions(data.actions ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount/filter change
    fetchActions();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const res = await authFetch(`/api/admin/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchActions();
  };

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] opacity-80 mb-2">
          CRM
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
          Solicitudes de información
        </h1>
        <p className="mt-3 text-[var(--foreground)] opacity-85 leading-relaxed max-w-2xl">
          Cuando un usuario registrado hace clic en &quot;Solicitar información&quot; en una empresa, aparece aquí. Revisa quién ha pedido info de qué empresa y actualiza el estado: pendiente, gestionada o rechazada para llevar el seguimiento.
        </p>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
          Filtra por estado para ver solo pendientes o ya gestionadas.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            filter === ""
              ? "bg-[var(--brand-primary)] text-white"
              : "bg-white border-2 border-[var(--brand-primary)]/20 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setFilter("PENDING")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            filter === "PENDING"
              ? "bg-amber-500 text-white"
              : "bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
          }`}
        >
          Pendientes
        </button>
        <button
          type="button"
          onClick={() => setFilter("MANAGED")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            filter === "MANAGED"
              ? "bg-green-600 text-white"
              : "bg-white border-2 border-green-200 text-green-700 hover:bg-green-50"
          }`}
        >
          Gestionadas
        </button>
        <button
          type="button"
          onClick={() => setFilter("REJECTED")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            filter === "REJECTED"
              ? "bg-red-600 text-white"
              : "bg-white border-2 border-red-200 text-red-700 hover:bg-red-50"
          }`}
        >
          Rechazadas
        </button>
      </div>

      <div className="rounded-2xl border-2 border-[var(--brand-primary)]/10 bg-white shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[var(--foreground)] opacity-70">
            Cargando…
          </div>
        ) : actions.length === 0 ? (
          <div className="p-12 text-center text-[var(--foreground)] opacity-80">
            No hay solicitudes de información con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5">
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Usuario
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Empresa
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Fecha
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {actions.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--brand-primary)]/10 hover:bg-[var(--brand-bg)]/50"
                  >
                    <td className="px-4 py-3 text-[var(--foreground)]">
                      {row.userEmail}
                    </td>
                    <td className="px-4 py-3">
                      {row.companyId.startsWith("mock-") ? (
                        <span>{row.companyName}</span>
                      ) : (
                        <Link
                          href={`/admin/companies/${row.companyId}`}
                          className="text-[var(--brand-primary)] hover:underline"
                        >
                          {row.companyName}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground)] opacity-85">
                      {new Date(row.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status ?? "PENDING"}
                        onChange={(e) =>
                          updateStatus(row.id, e.target.value)
                        }
                        className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 ${
                          row.status === "MANAGED"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : row.status === "REJECTED"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        <option value="PENDING">
                          {STATUS_LABELS.PENDING}
                        </option>
                        <option value="MANAGED">
                          {STATUS_LABELS.MANAGED}
                        </option>
                        <option value="REJECTED">
                          {STATUS_LABELS.REJECTED}
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
