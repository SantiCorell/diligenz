"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { authFetch } from "@/lib/auth-client";

type Props = {
  companyId: string;
  initialFavorite?: boolean;
  /** compacto para tarjetas del catálogo */
  variant?: "icon" | "button";
  /** icon pequeño (tarjeta catálogo) */
  size?: "md" | "sm";
  onChange?: (favorite: boolean) => void;
};

export default function CompanyFavoriteButton({
  companyId,
  initialFavorite = false,
  variant = "button",
  size = "md",
  onChange,
}: Props) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const next = !favorite;
    try {
      const res = await authFetch(
        `/api/companies/${companyId}/interest${next ? "" : "?type=FAVORITE"}`,
        next
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "FAVORITE" }),
            }
          : { method: "DELETE" }
      );
      if (!res.ok) return;
      setFavorite(next);
      onChange?.(next);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    const sm = size === "sm";
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggle();
        }}
        disabled={loading}
        className={`inline-flex shrink-0 items-center justify-center rounded-full border transition ${
          sm ? "h-7 w-7" : "h-9 w-9"
        } ${
          favorite
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-[var(--brand-primary)]/15 bg-white/90 text-[var(--brand-dark)]/55 hover:border-rose-200 hover:text-rose-500"
        } disabled:opacity-60`}
        aria-pressed={favorite}
        aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      >
        <Heart
          className={`${sm ? "h-3.5 w-3.5" : "h-4 w-4"} ${favorite ? "fill-current" : ""}`}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={loading}
      className={`w-full rounded-xl border py-3 text-sm font-semibold transition disabled:opacity-60 ${
        favorite
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-[var(--brand-primary)]/20 bg-white text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} aria-hidden />
        {favorite ? "En favoritos" : "Guardar en favoritos"}
      </span>
    </button>
  );
}
