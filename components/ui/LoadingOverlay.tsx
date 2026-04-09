"use client";

type Props = {
  message: string;
  /** z-index por encima de modales (auth) o por debajo */
  zClass?: string;
};

export default function LoadingOverlay({ message, zClass = "z-[200]" }: Props) {
  return (
    <div
      className={`fixed inset-0 ${zClass} flex items-center justify-center bg-black/30 backdrop-blur-[2px]`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-4 rounded-2xl bg-white px-8 py-7 shadow-xl flex flex-col items-center gap-4 border border-[var(--brand-primary)]/15">
        <span
          className="h-11 w-11 animate-spin rounded-full border-[3px] border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)]"
          aria-hidden
        />
        <p className="text-sm font-medium text-center text-[var(--brand-primary)] max-w-xs">
          {message}
        </p>
      </div>
    </div>
  );
}
