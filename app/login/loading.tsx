export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-bg)] via-white to-[var(--brand-primary)]/5 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="h-24 w-24 rounded-xl bg-[var(--brand-primary)]/10" />
        <div className="h-8 w-48 rounded-lg bg-[var(--brand-primary)]/10" />
        <div className="h-4 w-64 rounded bg-[var(--brand-primary)]/5" />
      </div>
    </div>
  );
}
