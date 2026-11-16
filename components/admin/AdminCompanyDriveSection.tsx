import AdminBuyerDocumentsForm from "@/components/admin/AdminBuyerDocumentsForm";
import type { BuyerDocument } from "@/lib/buyer-documents";

type Props = {
  companyId: string;
  ownerLabel: string;
  companyDriveUrl: string | null;
  ownerDriveUrl: string;
  buyerDocuments: BuyerDocument[];
};

export default function AdminCompanyDriveSection({
  companyId,
  ownerLabel,
  companyDriveUrl,
  ownerDriveUrl,
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
        <form action="/api/admin/company/update" method="POST" className="mt-4 space-y-3">
          <input type="hidden" name="companyId" value={companyId} />
          <input type="hidden" name="partial" value="drive" />
          <label className="block text-sm">
            <span className="font-semibold text-[var(--brand-primary)]">
              Enlace de la carpeta del negocio
            </span>
            <input
              type="url"
              name="driveFolderUrl"
              defaultValue={companyDriveUrl ?? ""}
              placeholder="https://drive.google.com/drive/folders/…"
              className="mt-1 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </label>
          <p className="text-xs text-[var(--foreground)] opacity-75">
            Crea la carpeta en Google Drive y pega aquí el enlace. Si lo dejas vacío y guardas, se
            quita el enlace de esta ficha. La carpeta en Drive no se borra.
          </p>
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 transition"
          >
            Guardar enlace
          </button>
        </form>
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
              Todavía no hay carpeta enlazada. Pega la URL cuando la hayas creado.
            </p>
          )}
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

      <AdminBuyerDocumentsForm
        companyId={companyId}
        initialDocuments={buyerDocuments}
      />
    </section>
  );
}
