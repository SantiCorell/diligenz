export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)]">
      {/* Skeleton del sidebar */}
      <aside className="w-64 bg-[var(--brand-primary)]/90 border-r border-white/10 flex flex-col shrink-0">
        <div className="h-[73px] border-b border-white/10 animate-pulse" />
        <nav className="p-3 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 rounded-lg bg-white/10 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </nav>
      </aside>
      {/* Skeleton del contenido */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-[var(--brand-primary)]/10 bg-white/50 animate-pulse" />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-24 rounded-xl bg-[var(--brand-primary)]/5" />
            <div className="h-32 rounded-xl bg-[var(--brand-primary)]/5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-40 rounded-xl bg-[var(--brand-primary)]/5" />
              <div className="h-40 rounded-xl bg-[var(--brand-primary)]/5" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
