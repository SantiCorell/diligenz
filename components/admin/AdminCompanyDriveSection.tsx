import AdminBuyerDocumentsForm from "@/components/admin/AdminBuyerDocumentsForm";
import type { BuyerDocument } from "@/lib/buyer-documents";

type Props = {
  companyId: string;
  ownerLabel: string;
  companyDriveUrl: string | null;
  ownerDriveUrl: string;
  attachmentsApproved: boolean;
  buyerDocuments: BuyerDocument[];
};

export default function AdminCompanyDriveSection({
  companyId,
  ownerLabel,
  companyDriveUrl,
  ownerDriveUrl,
  attachmentsApproved,
  buyerDocuments,
}: Props) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentación (Google Drive)
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          Acceso interno al Drive de <strong>{ownerLabel}</strong> (mandato, DNI y archivos del
          proyecto). Los compradores <strong>no</strong> ven esta carpeta: solo los enlaces que
          indiques abajo.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {companyDriveUrl ? (
            <a
              href={companyDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              Carpeta del negocio →
            </a>
          ) : (
            <p className="text-sm text-[var(--foreground)] opacity-75">
              La carpeta del negocio se creará cuando Google Drive esté configurado. Si no aparece,
              contacta con Diligenz.
            </p>
          )}
          {ownerDriveUrl ? (
            <a
              href={ownerDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/25 text-[var(--brand-primary)] hover:bg-[var(--brand-bg-lavender)]/50 transition"
            >
              Carpeta CLIENTES del titular →
            </a>
          ) : null}
        </div>
      </div>

      <AdminBuyerDocumentsForm
        companyId={companyId}
        attachmentsApproved={attachmentsApproved}
        initialDocuments={buyerDocuments}
      />
    </section>
  );
}
