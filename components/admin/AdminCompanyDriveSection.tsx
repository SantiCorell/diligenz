import AdminBuyerDocumentsForm from "@/components/admin/AdminBuyerDocumentsForm";
import type { BuyerDocument } from "@/lib/buyer-documents";

type InterestSummary = {
  seenTeaser: number;
  favorites: number;
  favoritePeople: { label: string; email: string }[];
  advanced: number;
};

type Props = {
  companyId: string;
  ownerLabel: string;
  companyDriveUrl: string | null;
  ownerDriveUrl: string;
  buyerDocuments: BuyerDocument[];
  interestSummary: InterestSummary;
};

export default function AdminCompanyDriveSection({
  companyId,
  ownerLabel,
  companyDriveUrl,
  ownerDriveUrl,
  buyerDocuments,
  interestSummary,
}: Props) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentación (Google Drive)
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          Acceso interno al Drive de <strong>{ownerLabel}</strong> (mandato, DNI y archivos del
          proyecto). Los compradores no ven esta carpeta.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {ownerDriveUrl ? (
            <a
              href={ownerDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/25 text-[var(--brand-primary)] hover:bg-[var(--brand-bg-lavender)]/50 transition"
            >
              Carpeta Drive del titular →
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[var(--brand-primary)]/10 pt-6">
        <h3 className="text-sm font-semibold text-[var(--brand-primary)]">Resumen de interés</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--brand-bg-lavender)]/40 px-4 py-3">
            <dt className="text-xs text-[var(--foreground)] opacity-70">Han visto el teaser</dt>
            <dd className="mt-1 text-2xl font-semibold text-[var(--brand-primary)]">
              {interestSummary.seenTeaser}
            </dd>
          </div>
          <div className="rounded-xl bg-[var(--brand-bg-lavender)]/40 px-4 py-3 sm:col-span-1">
            <dt className="text-xs text-[var(--foreground)] opacity-70">En favoritos</dt>
            <dd className="mt-1 text-2xl font-semibold text-[var(--brand-primary)]">
              {interestSummary.favorites}
            </dd>
            {interestSummary.favoritePeople.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {interestSummary.favoritePeople.map((person) => (
                  <li key={person.email} className="truncate text-xs text-[var(--foreground)]">
                    {person.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-[var(--foreground)] opacity-60">Nadie todavía.</p>
            )}
          </div>
          <div className="rounded-xl bg-[var(--brand-bg-lavender)]/40 px-4 py-3">
            <dt className="text-xs text-[var(--foreground)] opacity-70">Han pulsado Quiero avanzar</dt>
            <dd className="mt-1 text-2xl font-semibold text-[var(--brand-primary)]">
              {interestSummary.advanced}
            </dd>
          </div>
        </dl>
      </div>

      <AdminBuyerDocumentsForm
        companyId={companyId}
        initialDocuments={buyerDocuments}
        companyDriveUrl={companyDriveUrl}
      />
    </section>
  );
}
