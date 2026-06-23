import { getSectorVisual } from "@/lib/sector-visual";

type Props = {
  sector: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const SIZE_STYLES = {
  xs: { container: "h-10 w-10", icon: "h-5 w-5" },
  sm: { container: "h-9 w-9 sm:h-10 sm:w-10", icon: "h-4 w-4 sm:h-[18px] sm:w-[18px]" },
  md: { container: "h-12 w-12", icon: "h-5 w-5" },
  lg: { container: "h-14 w-14", icon: "h-6 w-6" },
} as const;

export default function SectorIcon({ sector, size = "md", className = "" }: Props) {
  const visual = getSectorVisual(sector);
  const Icon = visual.icon;
  const { container, icon } = SIZE_STYLES[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${container} ${visual.iconBgClass} ${className}`}
      title={visual.label}
      aria-hidden
    >
      <Icon className={icon} strokeWidth={2} />
    </div>
  );
}
