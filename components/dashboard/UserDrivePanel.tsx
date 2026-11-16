type Props = {
  driveUrl: string;
  uploadUrl: string;
};

export default function UserDrivePanel({ driveUrl, uploadUrl }: Props) {
  const links = [
    driveUrl
      ? { href: driveUrl, label: "Abrir carpeta Drive" }
      : null,
    uploadUrl
      ? { href: uploadUrl, label: "Subir documentación" }
      : null,
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <div className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 md:p-8">
      <h2 className="text-lg font-semibold text-[var(--brand-primary)] mb-3">Documentación</h2>
      {links.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
            >
              {link.label} →
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-bg)]/60 px-4 py-5 text-sm text-[var(--foreground)]">
          Tus enlaces aparecerán aquí cuando el equipo los haya guardado en tu ficha.
        </div>
      )}
    </div>
  );
}
