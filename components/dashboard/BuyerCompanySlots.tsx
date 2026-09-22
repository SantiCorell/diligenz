import Link from "next/link";
import { Download, Headset, Lock, MessageSquare, Phone, Plus } from "lucide-react";
import type { RequestStatus } from "@prisma/client";
import type { CompanyMock } from "@/lib/mock-companies";
import CompanyCard from "@/components/companies/CompanyCard";
import BuyerRequestDecision from "@/components/dashboard/BuyerRequestDecision";
import {
  buyerMomentCopy,
  isActiveRequestStatus,
  normalizeRequestStatus,
  requestStatusLabel,
  type PipelineStatus,
} from "@/lib/info-request-pipeline";

export type BuyerSlotDocument = {
  label: string;
  url: string;
};

export type BuyerCompanySlot = {
  companyId: string;
  interestId: string;
  name: string;
  status: RequestStatus;
  published: boolean;
  company: CompanyMock | null;
  createdAt: Date;
  teaserDocuments: BuyerSlotDocument[];
};

const STATUS_CLASS: Record<PipelineStatus, string> = {
  PENDING_NDA: "bg-amber-100 text-amber-900",
  IN_REVIEW: "bg-amber-100 text-amber-950",
  TEASER: "bg-violet-100 text-violet-900",
  CONVERSATIONS: "bg-sky-100 text-sky-900",
  CLOSED: "bg-neutral-100 text-neutral-600",
  REJECTED: "bg-red-50 text-red-800",
};

type Props = {
  filled: BuyerCompanySlot[];
  maxSlots: number;
  isUnlimited?: boolean;
};

export default function BuyerCompanySlots({ filled, maxSlots, isUnlimited }: Props) {
  const activeCount = filled.filter((slot) => isActiveRequestStatus(slot.status)).length;
  const emptyCount = isUnlimited ? (filled.length === 0 ? 1 : 0) : Math.max(0, maxSlots - activeCount);
  const atLimit = !isUnlimited && activeCount >= maxSlots;
  const ordered = [...filled].sort((a, b) => {
    const rank = (status: RequestStatus) => {
      const stage = normalizeRequestStatus(status);
      if (stage === "REJECTED") return 2;
      if (stage === "CLOSED") return 1;
      return 0;
    };
    return rank(a.status) - rank(b.status);
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {ordered.map((slot) => (
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
  const stage = normalizeRequestStatus(slot.status);
  const moment = buyerMomentCopy(stage);

  const statusBar = (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:text-xs ${STATUS_CLASS[stage]}`}
      >
        {requestStatusLabel(stage)}
      </span>
      <span className="text-[11px] text-[var(--foreground)]/55">{dateLabel}</span>
    </div>
  );

  const quiet = stage === "REJECTED" || stage === "CLOSED";
  const nextStep = (
    <SlotNextStep
      stage={stage}
      moment={moment}
      interestId={slot.interestId}
      sector={slot.company?.sector}
      documents={slot.teaserDocuments}
    />
  );

  if (quiet || !slot.company || !slot.published) {
    return (
      <div className={`flex h-full flex-col ${stage === "REJECTED" ? "opacity-55" : ""}`}>
        {statusBar}
        <article className="flex h-full flex-col rounded-[1.5rem] border border-[var(--brand-dark)]/[0.08] bg-white p-5">
          <h3 className="text-lg font-extrabold tracking-tight text-[var(--brand-dark)]">{slot.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--brand-dark)]/60">
            {slot.company?.description || moment.body}
          </p>
          {nextStep}
        </article>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {statusBar}
      <CompanyCard
        company={slot.company}
        isLoggedIn
        compact
        ctaLabel="Ver ficha"
        footer={nextStep}
      />
    </div>
  );
}

function SlotNextStep({
  stage,
  moment,
  interestId,
  sector,
  documents,
}: {
  stage: PipelineStatus;
  moment: { title: string; body: string };
  interestId: string;
  sector?: string;
  documents: BuyerSlotDocument[];
}) {
  if (stage === "CLOSED") {
    return (
      <div className="mt-4 text-sm text-slate-600">
        <p>{moment.body}</p>
        {sector && (
          <Link href={`/companies?sector=${encodeURIComponent(sector)}`} className="mt-3 inline-block font-semibold text-[var(--brand-primary)] hover:underline">
            Ver empresas similares →
          </Link>
        )}
      </div>
    );
  }
  if (stage === "REJECTED") {
    return (
      <div className="mt-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-700">{moment.title}</p>
        <p className="mt-1">{moment.body}</p>
      </div>
    );
  }
  if (stage === "PENDING_NDA") {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-orange-800">
            <Lock className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{moment.title}</p>
            <p className="mt-1 text-orange-950/80">{moment.body}</p>
          </div>
        </div>
        <Link href="/dashboard/nda" className="shrink-0 rounded-full bg-orange-700 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-800">
          Completar verificación →
        </Link>
      </div>
    );
  }
  if (stage === "IN_REVIEW") {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-800">
            <Headset className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{moment.title}</p>
            <p className="mt-1 text-amber-950/80">{moment.body}</p>
          </div>
        </div>
        <Link href="/contact" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          Hablar con mi gestor
        </Link>
      </div>
    );
  }
  if (stage === "TEASER") {
    return (
      <div className="mt-4 space-y-3">
        <TeaserFiles documents={documents} />
        <BuyerRequestDecision interestId={interestId} />
      </div>
    );
  }
  if (stage === "CONVERSATIONS") {
    return (
      <div className="mt-4 space-y-3">
        {documents.length > 0 && <TeaserFiles documents={documents} />}
        <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-800">
            <Phone className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{moment.title}</p>
            <p className="mt-1 text-violet-950/80">{moment.body}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function TeaserFiles({ documents }: { documents: BuyerSlotDocument[] }) {
  if (documents.length === 0) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Tu gestor te ha concedido el acceso, pero el documento todavía no está publicado. Te avisaremos en cuanto esté listo.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc, index) => (
        <li
          key={`${doc.url}-${index}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ead56a] bg-[#fff4c2] px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#6b5420]">
              <Download className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--brand-dark)]">Teaser listo para descargar</p>
              <p className="truncate text-xs text-[var(--brand-dark)]/65">
                {doc.label || "Documento confidencial"} · uso personal, no compartir
              </p>
            </div>
          </div>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Ver teaser
          </a>
        </li>
      ))}
    </ul>
  );
}

function EmptySlot() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-neutral-200 bg-neutral-50/80 p-6 text-center text-neutral-500 sm:min-h-[320px]">
      <Plus className="h-8 w-8 stroke-[1.5] text-[var(--brand-primary)]" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-[var(--brand-dark)]">Aquí aparecerá tu próxima solicitud</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed">
        Cuando pidas información sobre una empresa del marketplace, su ficha ocupará este hueco.
      </p>
      <Link href="/companies" className="mt-4 rounded-full border border-[var(--brand-primary)]/30 px-4 py-2 text-xs font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5">
        Explorar empresas
      </Link>
    </div>
  );
}
