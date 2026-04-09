export default function BuyerDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-40 rounded-2xl bg-[var(--brand-primary)]/10" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--brand-primary)]/8" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-44 rounded-2xl bg-[var(--brand-primary)]/8" />
        <div className="h-44 rounded-2xl bg-[var(--brand-primary)]/8" />
      </div>
    </div>
  );
}
