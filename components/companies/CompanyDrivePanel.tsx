type Props = {
  driveUrl: string | null;
  title?: string;
  description: string;
  buttonLabel?: string;
  emptyMessage?: string;
};

export default function CompanyDrivePanel({
  driveUrl,
  title = "Documentos (Google Drive)",
  description,
  buttonLabel = "Abrir carpeta de documentos →",
  emptyMessage = "La carpeta se creará automáticamente cuando Google Drive esté configurado en el servidor. Si no aparece, contacta con Diligenz.",
}: Props) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
      <h2 className="text-lg font-semibold text-[var(--brand-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--foreground)] opacity-90">{description}</p>
      {driveUrl ? (
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
        >
          {buttonLabel}
        </a>
      ) : (
        <p className="mt-4 text-sm text-[var(--foreground)] opacity-75">{emptyMessage}</p>
      )}
    </section>
  );
}
