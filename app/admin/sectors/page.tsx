"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type BuiltinSectorRow = {
  slug: string;
  label: string;
  shortLabel: string;
  iconKey: string;
  colorKey: string;
  kind: "builtin" | "legacy";
};

type DisplaySector = {
  key: string;
  id: string | null;
  slug: string;
  label: string;
  shortLabel: string | null;
  iconKey: string;
  colorKey: string;
  active: boolean;
  sortOrder: number;
  source: "custom" | "builtin" | "legacy";
  overridesBuiltin: boolean;
};

type SectorFormState = {
  label: string;
  shortLabel: string;
  slug: string;
  iconKey: string;
  colorKey: string;
};

type ListFilter = "all" | "system" | "custom";

function mergeSectorRows(
  dbSectors: SectorRow[],
  builtinSectors: BuiltinSectorRow[]
): DisplaySector[] {
  const builtinSlugs = new Set(builtinSectors.map((b) => b.slug));
  const dbBySlug = new Map(dbSectors.map((row) => [row.slug, row]));
  const merged: DisplaySector[] = [];

  for (const row of dbSectors) {
    merged.push({
      key: row.id,
      id: row.id,
      slug: row.slug,
      label: row.label,
      shortLabel: row.shortLabel,
      iconKey: row.iconKey,
      colorKey: row.colorKey,
      active: row.active,
      sortOrder: row.sortOrder,
      source: "custom",
      overridesBuiltin: builtinSlugs.has(row.slug),
    });
  }

  for (const builtin of builtinSectors) {
    if (dbBySlug.has(builtin.slug)) continue;
    merged.push({
      key: `builtin:${builtin.slug}`,
      id: null,
      slug: builtin.slug,
      label: builtin.label,
      shortLabel: builtin.shortLabel,
      iconKey: builtin.iconKey,
      colorKey: builtin.colorKey,
      active: true,
      sortOrder: 0,
      source: builtin.kind,
      overridesBuiltin: false,
    });
  }

  return merged.sort((a, b) => a.label.localeCompare(b.label, "es"));
}

function sourceBadge(row: DisplaySector) {
  if (row.overridesBuiltin) {
    return { text: "Personalizado", className: "bg-violet-100 text-violet-800" };
  }
  if (row.source === "builtin") {
    return { text: "Sistema", className: "bg-slate-100 text-slate-700" };
  }
  if (row.source === "legacy") {
    return { text: "Histórico", className: "bg-amber-50 text-amber-800" };
  }
  return { text: "Personalizado", className: "bg-violet-100 text-violet-800" };
}

export default function AdminSectorsPage() {
  const [dbSectors, setDbSectors] = useState<SectorRow[]>([]);
  const [builtinSectors, setBuiltinSectors] = useState<BuiltinSectorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<SectorFormState>({
    label: "",
    shortLabel: "",
    slug: "",
    iconKey: "PharmacyCross",
    colorKey: DEFAULT_SECTOR_COLOR_KEY,
  });
  const [editForm, setEditForm] = useState<SectorFormState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const allSectors = useMemo(
    () => mergeSectorRows(dbSectors, builtinSectors),
    [dbSectors, builtinSectors]
  );

  const filteredSectors = useMemo(() => {
    if (listFilter === "system") {
      return allSectors.filter((row) => row.source === "builtin" || row.source === "legacy");
    }
    if (listFilter === "custom") {
      return allSectors.filter((row) => row.id != null);
    }
    return allSectors;
  }, [allSectors, listFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/admin/sectors");
    const data = await res.json().catch(() => ({}));
    setDbSectors((data.sectors as SectorRow[]) ?? []);
    setBuiltinSectors((data.builtinSectors as BuiltinSectorRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (row: DisplaySector) => {
    setEditingKey(row.key);
    setEditForm({
      label: row.label,
      shortLabel: row.shortLabel ?? "",
      slug: row.slug,
      iconKey: row.iconKey,
      colorKey: row.colorKey,
    });
    setMsg(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditForm(null);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await authFetch("/api/admin/sectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: createForm.label,
          shortLabel: createForm.shortLabel || undefined,
          slug: createForm.slug || undefined,
          iconKey: createForm.iconKey,
          colorKey: createForm.colorKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg((data as { error?: string }).error ?? "Error al crear");
        return;
      }
      setCreateForm({
        label: "",
        shortLabel: "",
        slug: "",
        iconKey: "PharmacyCross",
        colorKey: DEFAULT_SECTOR_COLOR_KEY,
      });
      setMsg("Sector creado.");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (row: DisplaySector) => {
    if (!editForm) return;
    setMsg(null);
    setSaving(true);
    try {
      const payload = {
        label: editForm.label,
        shortLabel: editForm.shortLabel || null,
        iconKey: editForm.iconKey,
        colorKey: editForm.colorKey,
        ...(row.id ? { slug: editForm.slug } : { slug: row.slug }),
      };

      const res = row.id
        ? await authFetch(`/api/admin/sectors/${row.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await authFetch("/api/admin/sectors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              shortLabel: editForm.shortLabel || undefined,
              slug: row.slug,
            }),
          });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg((data as { error?: string }).error ?? "Error al guardar");
        return;
      }
      setMsg(row.id ? "Sector actualizado." : "Sector personalizado guardado.");
      cancelEdit();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: DisplaySector) => {
    if (!row.id) {
      startEdit(row);
      setMsg("Personaliza el sector para poder activarlo o desactivarlo.");
      return;
    }
    await authFetch(`/api/admin/sectors/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    await load();
  };

  const remove = async (row: DisplaySector) => {
    if (!row.id) return;
    const confirmText = row.overridesBuiltin
      ? `¿Restaurar el sector de sistema «${row.label}» a su configuración predeterminada?`
      : `¿Eliminar el sector «${row.label}»?`;
    if (!confirm(confirmText)) return;
    await authFetch(`/api/admin/sectors/${row.id}`, { method: "DELETE" });
    if (editingKey === row.key) cancelEdit();
    await load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-primary)]">Sectores</h1>
        <p className="mt-2 text-sm text-[var(--foreground)]/85 leading-relaxed">
          Consulta todos los sectores del marketplace: los integrados en la plataforma, los
          históricos y los que hayas creado. Puedes personalizar cualquiera (icono, color y nombre)
          o añadir sectores nuevos.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Todos los sectores
            {!loading && (
              <span className="ml-2 text-sm font-normal text-[var(--foreground)]/55">
                ({allSectors.length})
              </span>
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Todos"],
                ["system", "Sistema / histórico"],
                ["custom", "En base de datos"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setListFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  listFilter === value
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-[var(--brand-bg-lavender)]/50 text-[var(--brand-dark)]/70 hover:bg-[var(--brand-primary)]/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm opacity-70">Cargando…</p>
        ) : filteredSectors.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">No hay sectores con este filtro.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--brand-primary)]/10">
            {filteredSectors.map((row) => {
              const iconPreset = SECTOR_ICON_PRESETS.find((p) => p.key === row.iconKey);
              const colorPreset = SECTOR_COLOR_PRESETS.find((p) => p.key === row.colorKey);
              const RowIcon = iconPreset?.icon;
              const badge = sourceBadge(row);
              const isEditing = editingKey === row.key;

              return (
                <li key={row.key} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {RowIcon && colorPreset ? (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorPreset.iconBgClass}`}
                        >
                          <RowIcon className="h-4 w-4" strokeWidth={2} />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[var(--brand-dark)]">{row.label}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.className}`}
                          >
                            {badge.text}
                          </span>
                          {row.id && !row.active && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Desactivado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--foreground)]/65 mt-0.5">
                          {row.slug}
                          {row.shortLabel ? ` · ${row.shortLabel}` : ""}
                          {" · "}
                          {iconPreset?.label ?? row.iconKey}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => (isEditing ? cancelEdit() : startEdit(row))}
                        className="rounded-lg border border-[var(--brand-primary)]/25 px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)]"
                      >
                        {isEditing ? "Cerrar" : row.id ? "Editar" : "Personalizar"}
                      </button>
                      {row.id ? (
                        <>
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
                            {row.overridesBuiltin ? "Restaurar" : "Eliminar"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isEditing && editForm ? (
                    <SectorFormFields
                      form={editForm}
                      onChange={setEditForm}
                      slugReadOnly={!row.id || row.overridesBuiltin}
                      onSubmit={() => void saveEdit(row)}
                      submitLabel={row.id ? "Guardar cambios" : "Guardar personalización"}
                      saving={saving}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {msg && <p className="mt-4 text-sm text-[var(--foreground)]/80">{msg}</p>}
      </section>

      <section className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Nuevo sector</h2>
        <form
          onSubmit={create}
          className="mt-4"
        >
          <SectorFormFields
            form={createForm}
            onChange={setCreateForm}
            slugReadOnly={false}
            onSubmit={() => {}}
            submitLabel="Crear sector"
            saving={saving}
            autoSlugFromLabel
          />
        </form>
      </section>
    </div>
  );
}

function SectorFormFields({
  form,
  onChange,
  slugReadOnly,
  onSubmit,
  submitLabel,
  saving,
  autoSlugFromLabel,
}: {
  form: SectorFormState;
  onChange: (next: SectorFormState) => void;
  slugReadOnly: boolean;
  onSubmit: () => void;
  submitLabel: string;
  saving: boolean;
  autoSlugFromLabel?: boolean;
}) {
  const selectedIcon = SECTOR_ICON_PRESETS.find((p) => p.key === form.iconKey) ?? SECTOR_ICON_PRESETS[0];
  const selectedColor =
    SECTOR_COLOR_PRESETS.find((p) => p.key === form.colorKey) ?? SECTOR_COLOR_PRESETS[0];
  const PreviewIcon = selectedIcon.icon;

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 rounded-xl border border-[var(--brand-primary)]/10 bg-[var(--brand-bg-lavender)]/25 p-4">
      <div>
        <label className="block text-sm font-semibold text-[var(--brand-primary)]">Nombre *</label>
        <input
          required
          value={form.label}
          onChange={(e) => {
            const label = e.target.value;
            onChange({
              ...form,
              label,
              slug:
                autoSlugFromLabel && !form.slug
                  ? slugifySectorLabel(label)
                  : form.slug,
            });
          }}
          className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[var(--brand-primary)]">
          Etiqueta corta
        </label>
        <input
          value={form.shortLabel}
          onChange={(e) => onChange({ ...form, shortLabel: e.target.value })}
          className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm bg-white"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-[var(--brand-primary)]">
          Identificador (slug)
        </label>
        <input
          value={form.slug}
          readOnly={slugReadOnly}
          onChange={(e) => onChange({ ...form, slug: e.target.value })}
          className={`mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm ${
            slugReadOnly ? "bg-slate-50 text-[var(--foreground)]/60" : "bg-white"
          }`}
        />
        {slugReadOnly && (
          <p className="mt-1 text-xs text-[var(--foreground)]/55">
            El identificador no se puede cambiar en sectores de sistema.
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-[var(--brand-primary)]">
          Icono *{" "}
          <span className="font-normal text-[var(--foreground)]/55">
            ({SECTOR_ICON_PRESETS.length} disponibles)
          </span>
        </label>
        <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[var(--brand-primary)]/10 bg-white p-2">
          <div className="flex flex-wrap gap-2">
            {SECTOR_ICON_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = form.iconKey === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  title={preset.label}
                  onClick={() => onChange({ ...form, iconKey: preset.key })}
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
        </div>
        <p className="mt-1.5 text-xs text-[var(--foreground)]/60">{selectedIcon.label}</p>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-[var(--brand-primary)]">Color *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {SECTOR_COLOR_PRESETS.map((preset) => {
            const active = form.colorKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                title={preset.label}
                onClick={() => onChange({ ...form, colorKey: preset.key })}
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
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-xl bg-white/80 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]/55">
          Vista previa
        </span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedColor.iconBgClass}`}
        >
          <PreviewIcon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedColor.tagClass}`}>
          {form.shortLabel || form.label || "Sector"}
        </span>
      </div>
      <div className="sm:col-span-2">
        <button
          type={autoSlugFromLabel ? "submit" : "button"}
          onClick={autoSlugFromLabel ? undefined : onSubmit}
          disabled={saving}
          className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
        >
          {saving ? "Guardando…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
