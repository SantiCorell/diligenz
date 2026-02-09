// components/auth/RequireAuthModal.tsx
import Link from "next/link";

type RequireAuthModalProps = {
  onClose?: () => void;
};

export default function RequireAuthModal({
  onClose,
}: RequireAuthModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h3 className="text-xl font-semibold text-slate-900">
          Acceso restringido
        </h3>

        <p className="mt-3 text-slate-600">
          Para solicitar información confidencial sobre esta empresa necesitas
          tener una cuenta verificada.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/register"
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center font-medium text-white hover:bg-slate-800 transition"
          >
            Crear cuenta gratis
          </Link>

          <Link
            href="/login"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center font-medium hover:bg-slate-50 transition"
          >
            Iniciar sesión
          </Link>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full text-sm text-slate-500 hover:underline"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
