"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  companyId: string;
  companyName: string;
  /** Tras borrar correctamente (lista admin o vendedor) */
  redirectTo: string;
  /** `text` es el enlace corto de la tarjeta; `button` es la acción destacada. */
  variant?: "button" | "text";
};

export default function DeleteCompanyButton({
  companyId,
  companyName,
  redirectTo,
  variant = "button",
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar la empresa «${companyName}»?\n\n` +
        "No se borrará de la base de datos: quedará archivada y dejará de mostrarse en listados y en la web."
    );
    if (!ok) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/soft-remove`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar");
        setPending(false);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={
          variant === "text"
            ? "inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 disabled:opacity-60"
            : "rounded-xl px-4 py-2.5 text-sm font-semibold border-2 border-red-200 text-red-700 bg-white hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
        }
      >
        {variant === "text" ? (
          <>
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {pending ? "Eliminando…" : "Borrar"}
          </>
        ) : pending ? (
          "Eliminando…"
        ) : (
          "Borrar empresa"
        )}
      </button>
      {error && <p className="text-xs text-red-600 max-w-[14rem]">{error}</p>}
    </div>
  );
}
