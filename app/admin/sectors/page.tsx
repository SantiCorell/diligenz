"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-client";
import { SECTOR_ICON_PRESETS } from "@/lib/sector-icon-presets";
import { DEFAULT_SECTOR_COLOR_KEY, SECTOR_COLOR_PRESETS } from "@/lib/sector-color-presets";
import { slugifySectorLabel } from "@/lib/sector-slug";

type SectorRow = {
  id: string;
  slug: string;
  label: string;
  shortLabel: string | null;
  iconKey: string;
  colorKey: string;
  sortOrder: number;
  active: boolean;
};

export default function AdminSectorsPage() {
  const [sectors, setSectors] = useState<SectorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [shortLabel, setShortLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [iconKey, setIconKey] = useState("PharmacyCross");
  const [colorKey, setColorKey] = useState(DEFAULT_SECTOR_COLOR_KEY);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/admin/sectors");
    const data = await res.json().catch(() => ({}));
    setSectors((data.sectors as SectorRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedIcon = SECTOR_ICON_PRESETS.find((p) => p.key === iconKey) ?? SECTOR_ICON_PRESETS[0];
  const selectedColor =
    SECTOR_COLOR_PRESETS.find((p) => p.key === colorKey) ?? SECTOR_COLOR_PRESETS[0];
  const PreviewIcon = selectedIcon.icon;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await authFetch("/api/admin/sectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        shortLabel: shortLabel || undefined,
        slug: slug || undefined,
        iconKey,
        colorKey,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg((data as { error?: string }).error ?? "Error al crear");
      return;
    }
    setLabel("");
    setShortLabel("");
    setSlug("");
    setMsg("Sector creado.");
    load();
  };

  const toggleActive = async (row: SectorRow) => {
    await authFetch(`/api/admin/sectors/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    load();
  };

  const remove = async (row: SectorRow) => {
    if (!confirm(`¿Eliminar el sector «${row.label}»?`)) return;
    await authFetch(`/api/admin/sectors/${row.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-primary)]">Sectores</h1>
        <p className="mt-2 text-sm text-[var(--foreground)]/85">
          Los sectores integrados (incluido FARMA con cruz verde) ya están en los formularios. Aquí
          puedes añadir sectores personalizados eligiendo icono y color.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Nuevo sector</h2>
        <form onSubmit={create} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Nombre *</label>
            <input
              required
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!slug) setSlug(slugifySectorLabel(e.target.value));
              }}
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm"
              placeholder="Ej. Farma especializada"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Etiqueta corta
            </label>
            <input
              value={shortLabel}
              onChange={(e) => setShortLabel(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm"
              placeholder="Ej. Farma"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">
              Identificador (slug)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm"
              placeholder="Se genera del nombre"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Icono *</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTOR_ICON_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const active = iconKey === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    title={preset.label}
                    onClick={() => setIconKey(preset.key)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition ${
                      active
                        ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10"
                        : "border-[var(--brand-primary)]/15 bg-white hover:border-[var(--brand-primary)]/35"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-[var(--foreground)]/60">{selectedIcon?.label}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[var(--brand-primary)]">Color *</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTOR_COLOR_PRESETS.map((preset) => {
                const active = colorKey === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    title={preset.label}
                    onClick={() => setColorKey(preset.key)}
                    className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/25"
                        : "border-transparent"
                    } ${preset.tagClass}`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.accent }}
                      aria-hidden
                    />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-xl bg-[var(--brand-bg-lavender)]/40 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/55">
              Vista previa
            </span>
            {selectedIcon && selectedColor ? (
              <>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedColor.iconBgClass}`}
                >
                  <PreviewIcon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedColor.tagClass}`}>
                  {shortLabel || label || "Sector"}
                </span>
              </>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            >
              Crear sector
            </button>
            {msg && <p className="mt-2 text-sm text-[var(--foreground)]/80">{msg}</p>}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Sectores personalizados</h2>
        {loading ? (
          <p className="mt-4 text-sm opacity-70">Cargando…</p>
        ) : sectors.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">No hay sectores personalizados todavía.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--brand-primary)]/10">
            {sectors.map((row) => {
              const iconPreset = SECTOR_ICON_PRESETS.find((p) => p.key === row.iconKey);
              const colorPreset = SECTOR_COLOR_PRESETS.find((p) => p.key === row.colorKey);
              const RowIcon = iconPreset?.icon;
              return (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    {RowIcon && colorPreset ? (
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorPreset.iconBgClass}`}
                      >
                        <RowIcon className="h-4 w-4" strokeWidth={2} />
                      </div>
                    ) : null}
                    <div>
                      <p className="font-semibold text-[var(--brand-dark)]">{row.label}</p>
                      <p className="text-xs text-[var(--foreground)]/65">
                        {row.slug} · {iconPreset?.label ?? row.iconKey} ·{" "}
                        {colorPreset?.label ?? row.colorKey}
                        {!row.active && " · desactivado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(row)}
                      className="rounded-lg border border-[var(--brand-primary)]/25 px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)]"
                    >
                      {row.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
