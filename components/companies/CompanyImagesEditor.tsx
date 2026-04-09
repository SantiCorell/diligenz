"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-client";
import { ImagePlus, Star, Trash2 } from "lucide-react";

type FileRow = {
  id: string;
  name: string;
  kind: string;
  sortOrder: number;
};

export default function CompanyImagesEditor({
  companyId,
  readOnly = false,
}: {
  companyId: string;
  /** Proyecto ya publicado: solo vista, sin subir ni borrar */
  readOnly?: boolean;
}) {
  const [images, setImages] = useState<FileRow[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    authFetch(`/api/companies/${companyId}/files`)
      .then((r) => r.json())
      .then((d: { files?: FileRow[] }) => {
        const imgs = (d.files ?? []).filter((f) => f.kind === "image");
        imgs.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
        setImages(imgs);
      })
      .catch(() => setImages([]));
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const setCover = async (fileId: string) => {
    const res = await authFetch(`/api/companies/${companyId}/files/set-cover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    if (res.ok) load();
  };

  const remove = async (fileId: string) => {
    if (!confirm("¿Eliminar esta imagen del anuncio?")) return;
    const res = await authFetch(`/api/companies/${companyId}/files/${fileId}`, {
      method: "DELETE",
    });
    if (res.ok) load();
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!(file.type || "").startsWith("image/")) {
      alert("Selecciona un archivo de imagen (JPG, PNG, WebP…).");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await authFetch(`/api/companies/${companyId}/files`, {
        method: "POST",
        body: form,
      });
      if (res.ok) load();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (readOnly) {
    return (
      <div className="mt-4 space-y-4">
        <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          El proyecto está <strong>publicado en la web</strong>. La ficha, valoración e imágenes solo las
          modifica el equipo Diligenz desde administración. Si necesitas un cambio, contáctanos.
        </p>
        {images.length === 0 ? (
          <p className="text-sm text-[var(--foreground)] opacity-70">No hay imágenes subidas.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <li
                key={img.id}
                className="overflow-hidden rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] shadow-sm"
              >
                <div className="relative aspect-[16/10] bg-[var(--brand-bg-lavender)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/companies/${companyId}/files/${img.id}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-[var(--brand-primary)] px-2 py-0.5 text-xs font-semibold text-white">
                      Portada
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--brand-primary)]/15 px-4 py-2.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/20">
          <ImagePlus className="w-4 h-4" />
          {uploading ? "Subiendo…" : "Subir imagen"}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
        <span className="text-xs text-[var(--foreground)] opacity-70">
          La primera imagen (portada) se muestra en el listado y cabecera de la ficha pública. Máx. 15 MB.
        </span>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-[var(--foreground)] opacity-70">
          No hay imágenes. Sube al menos una para personalizar el anuncio; si no, se usa una imagen genérica por sector.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)] shadow-sm"
            >
              <div className="relative aspect-[16/10] bg-[var(--brand-bg-lavender)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/companies/${companyId}/files/${img.id}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-[var(--brand-primary)] px-2 py-0.5 text-xs font-semibold text-white">
                    Portada
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-[var(--brand-primary)]/10 p-3">
                <button
                  type="button"
                  onClick={() => setCover(img.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
                  title="Usar como portada"
                >
                  <Star className="w-3.5 h-3.5" />
                  Portada
                </button>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
