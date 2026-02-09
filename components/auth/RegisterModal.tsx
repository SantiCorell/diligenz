"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--brand-bg)] rounded-2xl border border-[var(--brand-primary)]/20 shadow-xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-[var(--brand-primary)]">
          Regístrate para ver el contenido completo
        </h3>
        <p className="mt-2 text-[var(--foreground)] opacity-85 text-sm">
          Crea una cuenta gratuita para acceder a la ficha completa de las empresas, datos financieros y poder solicitar información.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className="flex-1 text-center rounded-xl bg-[var(--brand-primary)] py-3 text-white font-medium hover:opacity-90"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="flex-1 text-center rounded-xl border-2 border-[var(--brand-primary)]/40 py-3 text-[var(--brand-primary)] font-medium hover:bg-[var(--brand-primary)]/5"
          >
            Ya tengo cuenta
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-sm text-[var(--foreground)] opacity-70 hover:opacity-100"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
