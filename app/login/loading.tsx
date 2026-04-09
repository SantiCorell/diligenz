export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/5 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-12 w-12 animate-spin rounded-full border-[3px] border-[var(--brand-primary)]/25 border-t-[var(--brand-primary)]"
          aria-hidden
        />
        <p className="text-sm font-medium text-[var(--brand-primary)]">Cargando inicio de sesión…</p>
      </div>
    </div>
  );
}
