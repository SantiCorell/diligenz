type Props = {
  companyId: string;
  ownerLabel: string;
  companyDriveUrl: string | null;
  ownerDriveUrl: string;
  attachmentsApproved: boolean;
  buyerTeaserUrl: string | null;
};

export default function AdminCompanyDriveSection({
  companyId,
  ownerLabel,
  companyDriveUrl,
  ownerDriveUrl,
  attachmentsApproved,
  buyerTeaserUrl,
}: Props) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Documentación (Google Drive)
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">
          Acceso interno al Drive de <strong>{ownerLabel}</strong> (mandato, DNI y archivos del
          proyecto). Los compradores <strong>no</strong> ven esta carpeta: solo el enlace único que
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

      <form
        action="/api/admin/company/update"
        method="POST"
        className="rounded-xl border-2 border-[var(--brand-primary)]/15 bg-[var(--brand-bg-lavender)]/40 p-5 space-y-4"
      >
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="partial" value="visibility" />
        <p className="text-sm font-semibold text-[var(--brand-primary)]">Acceso para compradores</p>
        <div>
          <label
            htmlFor="buyerTeaserUrl"
            className="block text-sm font-medium text-[var(--foreground)]"
          >
            Enlace al documento / teaser (único)
          </label>
          <input
            type="url"
            name="buyerTeaserUrl"
            id="buyerTeaserUrl"
            defaultValue={buyerTeaserUrl ?? ""}
            placeholder="https://drive.google.com/file/d/… o enlace directo al PDF"
            className="mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
            Un solo archivo o enlace. El comprador no accede al resto de la documentación del
            negocio.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="attachmentsApproved"
            id="attachmentsApproved"
            defaultChecked={attachmentsApproved}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
          />
          <span className="text-sm font-medium text-[var(--foreground)]">
            Permitir descarga cuando la solicitud de información esté en gestión
          </span>
        </label>
        <button
          type="submit"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-md hover:opacity-95 transition"
        >
          Guardar acceso compradores
        </button>
      </form>
    </section>
  );
}
