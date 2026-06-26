"use client";

type Props = {
  open: boolean;
  companyName: string;
  loading: boolean;
  success: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RequestInfoModal({
  open,
  companyName,
  loading,
  success,
  error,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={loading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-info-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--brand-primary)]/20 bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
              Solicitud enviada
            </p>
            <h3
              id="request-info-modal-title"
              className="mt-2 text-xl font-semibold text-[var(--brand-dark)]"
            >
              Gracias por tu interés
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/85">
              Se ha solicitado información sobre <strong>{companyName}</strong>. En breve un
              compañero se pondrá en contacto contigo.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Entendido
            </button>
          </>
        ) : (
          <>
            <h3
              id="request-info-modal-title"
              className="text-xl font-semibold text-[var(--brand-primary)]"
            >
              Solicitar información
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/85">
              ¿Quieres recibir información confidencial sobre{" "}
              <strong>{companyName}</strong>? Un miembro del equipo Diligenz revisará tu solicitud y
              se pondrá en contacto contigo.
            </p>
            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border-2 border-[var(--brand-primary)]/25 py-3 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Solicitar información"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
