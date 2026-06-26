import Link from "next/link";
import { Plus } from "lucide-react";
import { SELL_DASHBOARD_PATH } from "@/lib/companies-dashboard-path";

export type ProfessionalCompanySlot = {
  id: string;
  title: string;
  sector: string;
  location: string;
  statusLabel: string;
  statusClass: string;
};

type Props = {
  filled: ProfessionalCompanySlot[];
  maxSlots: number;
  isUnlimited?: boolean;
};

export default function ProfessionalCompanySlots({
  filled,
  maxSlots,
  isUnlimited,
}: Props) {
  const emptyCount = isUnlimited ? 0 : Math.max(0, maxSlots - filled.length);
  const atLimit = !isUnlimited && filled.length >= maxSlots;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {filled.map((slot) => (
          <FilledSlot key={slot.id} slot={slot} />
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <EmptySlot key={`empty-${i}`} />
        ))}
      </div>

      {atLimit && (
        <div className="rounded-xl border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)]/50 px-4 py-3 text-sm text-[var(--foreground)]/85">
          <p className="font-medium text-[var(--brand-dark)]">
            Has alcanzado el límite de {maxSlots} empresas activas
          </p>
          <p className="mt-1 leading-relaxed">
            No puedes subir más proyectos hasta liberar un espacio. Si necesitas más capacidad,{" "}
            <Link href="/contact" className="font-semibold text-[var(--brand-primary)] hover:underline">
              ponte en contacto
            </Link>{" "}
            y ampliaremos tu acceso.
          </p>
        </div>
      )}

      {!isUnlimited && filled.length === 0 && (
        <p className="text-center text-sm text-[var(--foreground)]/70">
          Tienes {maxSlots} espacios disponibles. Pulsa en + para subir una empresa.
        </p>
      )}
    </div>
  );
}

function FilledSlot({ slot }: { slot: ProfessionalCompanySlot }) {
  return (
    <Link
      href={`/dashboard/seller/companies/${slot.id}`}
      className="flex min-h-[148px] flex-col rounded-xl border border-[var(--brand-primary)]/15 bg-white p-4 shadow-sm transition hover:border-[var(--brand-primary)]/30 hover:shadow-md sm:min-h-[160px]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span
          className={`inline-flex rounded-md text-[10px] font-semibold px-2 py-0.5 sm:text-xs ${slot.statusClass}`}
        >
          {slot.statusLabel}
        </span>
        <span className="rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--brand-primary)] sm:text-xs">
          {slot.sector}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[var(--brand-dark)] sm:text-base">
        {slot.title}
      </h3>
      <p className="mt-1 truncate text-[11px] text-[var(--foreground)]/60 sm:text-xs">
        {slot.location}
      </p>
      <span className="mt-auto pt-3 text-xs font-semibold text-[var(--brand-primary)]">
        Gestionar →
      </span>
    </Link>
  );
}

function EmptySlot() {
  return (
    <Link
      href={SELL_DASHBOARD_PATH}
      className="flex min-h-[148px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/80 p-6 text-neutral-400 transition hover:border-[var(--brand-primary)]/25 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] sm:min-h-[160px]"
    >
      <Plus className="h-10 w-10 stroke-[1.5]" aria-hidden />
      <span className="mt-3 text-sm font-medium">Subir empresa</span>
    </Link>
  );
}
