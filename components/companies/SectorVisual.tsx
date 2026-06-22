import { getSectorVisual } from "@/lib/sector-visual";

type Props = {
  sector: string;
  variant?: "card" | "banner";
  compact?: boolean;
};

export default function SectorVisual({ sector, variant = "card", compact = false }: Props) {
  const visual = getSectorVisual(sector);
  const Icon = visual.icon;

  if (variant === "banner") {
    return (
      <div className="relative overflow-hidden border-b border-black/[0.05] bg-[var(--surface-card)]">
        <div
          className="pointer-events-none absolute -right-4 -top-6 opacity-[0.04]"
          aria-hidden
        >
          <Icon className="h-36 w-36 text-[var(--foreground)]" strokeWidth={1.1} />
        </div>
        <div className="relative flex items-center gap-4 px-6 py-5 md:px-8 md:py-6">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] bg-[var(--surface-muted)]"
            style={{ color: visual.iconColor }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--foreground)]/40">
              Sector
            </p>
            <p className="mt-0.5 text-base font-medium text-[var(--foreground)] md:text-lg">
              {visual.label}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const iconSize = compact ? "h-9 w-9" : "h-10 w-10";
  const glyphSize = compact ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <div
      className={`relative shrink-0 rounded-lg border border-black/[0.06] bg-[var(--surface-muted)] ${iconSize} flex items-center justify-center`}
      style={{ color: visual.iconColor }}
      title={visual.label}
    >
      <Icon className={glyphSize} strokeWidth={1.75} />
    </div>
  );
}
