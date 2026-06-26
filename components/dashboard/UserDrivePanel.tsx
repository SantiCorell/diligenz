type Props = {
  title: string;
  driveUrl: string;
  description: string;
};

export default function UserDrivePanel({ title, driveUrl, description }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 md:p-8">
      <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">{title}</h2>
      {driveUrl ? (
        <>
          <p className="text-sm text-[var(--foreground)] opacity-90 mb-5">{description}</p>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Abrir mi Drive →
          </a>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-bg)]/60 px-4 py-5 text-sm text-[var(--foreground)] opacity-90">
          Tu enlace personal a Drive se mostrará aquí cuando lo configuremos. En cada empresa
          tendrás además una carpeta propia para subir documentación.
        </div>
      )}
    </div>
  );
}
