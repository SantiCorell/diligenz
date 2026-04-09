"use client";

import { useState, useEffect } from "react";

type UserRow = { id: string; email: string; name: string | null; role: string };

type Props = {
  name?: string;
  initialUserId: string;
  initialSummary: string;
};

export default function UserOwnerSearch({
  name = "ownerId",
  initialUserId,
  initialSummary,
}: Props) {
  const [ownerId, setOwnerId] = useState(initialUserId);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [assignedSummary, setAssignedSummary] = useState(
    initialUserId ? initialSummary : "Ninguno — busca y elige un usuario"
  );

  useEffect(() => {
    if (query.trim().length < 2) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- vaciar resultados si la búsqueda es demasiado corta */
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/admin/users/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((d: { users?: UserRow[] }) => setResults(d.users ?? []))
        .catch(() => setResults([]));
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative max-w-xl">
      <input type="hidden" name={name} value={ownerId} />
      <label className="block text-sm font-semibold text-[var(--brand-primary)]">
        Propietario (buscar por nombre o email)
      </label>
      <input
        type="text"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 220)}
        placeholder="Escribe al menos 2 caracteres…"
        className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
      />
      {open && results.length > 0 && (
        <ul
          className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[var(--brand-primary)]/20 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--brand-bg-lavender)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOwnerId(u.id);
                  setQuery("");
                  setAssignedSummary(`${u.name ? `${u.name} · ` : ""}${u.email} (${u.role})`);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-[var(--foreground)]">
                  {u.name ?? u.email}
                </span>
                <span className="block text-xs text-[var(--foreground)] opacity-70">
                  {u.email} · {u.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-[var(--foreground)] opacity-75">
        Se guardará como propietario: <strong>{assignedSummary}</strong>
      </p>
    </div>
  );
}
