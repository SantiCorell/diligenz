import Link from "next/link";
import { Plus } from "lucide-react";
import type { RequestStatus } from "@prisma/client";
import type { CompanyMock } from "@/lib/mock-companies";
import CompanyCard from "@/components/companies/CompanyCard";

export type BuyerCompanySlot = {
  companyId: string;
  name: string;
  status: RequestStatus;
  published: boolean;
  company: CompanyMock | null;
  createdAt: Date;
};

function statusLabel(s: RequestStatus): string {
  if (s === "PENDING") return "En revisión";
  if (s === "MANAGED") return "En gestión";
  return "Cerrada";
}

function statusClass(s: RequestStatus): string {
  if (s === "PENDING") return "bg-amber-100 text-amber-900";
  if (s === "MANAGED") return "bg-sky-100 text-sky-900";
  return "bg-neutral-100 text-neutral-600";
}

type Props = {
  filled: BuyerCompanySlot[];
  maxSlots: number;
  isUnlimited?: boolean;
};

export default function BuyerCompanySlots({ filled, maxSlots, isUnlimited }: Props) {
  const emptyCount = isUnlimited ? 0 : Math.max(0, maxSlots - filled.length);
  const atLimit = !isUnlimited && filled.length >= maxSlots;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {filled.map((slot) => (
          <FilledSlot key={slot.companyId} slot={slot} />
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
            No puedes solicitar más información hasta que alguna solicitud se cierre. Si necesitas
            más oportunidades,{" "}
            <Link href="/contact" className="font-semibold text-[var(--brand-primary)] hover:underline">
              ponte en contacto
            </Link>{" "}
            y ampliaremos tu acceso.
          </p>
        </div>
      )}

      {!isUnlimited && filled.length === 0 && (
        <p className="text-center text-sm text-[var(--foreground)]/70">
          Tienes {maxSlots} espacios disponibles. Pulsa en + para explorar empresas y solicitar
          información.
        </p>
      )}
    </div>
  );
}

function FilledSlot({ slot }: { slot: BuyerCompanySlot }) {
  const dateLabel = new Date(slot.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusBar = (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
      <span
        className={`inline-flex rounded-md text-[10px] font-semibold px-2 py-0.5 sm:text-xs ${statusClass(slot.status)}`}
      >
        {statusLabel(slot.status)}
      </span>
      <span className="text-[11px] text-[var(--foreground)]/55">{dateLabel}</span>
    </div>
  );

  if (slot.company && slot.published) {
    return (
      <div className="flex h-full flex-col">
        {statusBar}
        <CompanyCard
          company={slot.company}
          isLoggedIn
          compact
          ctaLabel="Ver ficha"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {statusBar}
      <div className="flex min-h-[300px] flex-1 flex-col justify-center rounded-[1.75rem] border border-[var(--brand-primary)]/15 bg-[var(--brand-bg)]/40 p-5 sm:min-h-[320px]">
        <h3 className="text-lg font-semibold text-[var(--brand-dark)]">{slot.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/75">
          Esta operación aún no está publicada en el catálogo. El equipo te informará por otros
          canales.
        </p>
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <Link
      href="/companies"
      className="flex min-h-[300px] flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-neutral-200 bg-neutral-50/80 p-6 text-neutral-400 transition hover:border-[var(--brand-primary)]/25 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)] sm:min-h-[320px]"
    >
      <Plus className="h-10 w-10 stroke-[1.5]" aria-hidden />
      <span className="mt-3 text-sm font-medium">Añadir empresa</span>
    </Link>
  );
}
