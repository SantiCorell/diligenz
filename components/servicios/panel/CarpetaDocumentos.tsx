import { FileText, Plus } from "lucide-react";

export default function CarpetaDocumentos({
  driveUrl,
  title = "Tu carpeta de documentos",
  emptyText = "Tu gestor abrirá la carpeta en cuanto empiece el trámite. Mientras tanto, el DNI se sube desde Mi perfil.",
}: {
  driveUrl: string | null;
  title?: string;
  emptyText?: string;
}) {
  return (
    <section className="rounded-3xl border border-[#ece6f5] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[var(--brand-dark)]">{title}</h2>
        {driveUrl ? (
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[#f7f2ff]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Subir documento
          </a>
        ) : (
          <span className="rounded-full border border-[#ece6f5] px-4 py-2 text-sm font-semibold text-[var(--foreground)]/45">
            Carpeta pendiente
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-[var(--foreground)]/60">
        Carpeta compartida (Drive): todo lo que subáis tú y tu gestor queda aquí, en un único sitio.
      </p>
      {driveUrl ? (
        <a
          href={driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-[#f0ebf7] px-4 py-3 text-sm hover:bg-[#faf8fd]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efff] text-[#7c4dff]">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <span>
            <span className="block font-semibold text-[var(--brand-dark)]">Abrir la carpeta compartida</span>
            <span className="text-xs text-[var(--foreground)]/55">Los documentos del expediente aparecen al subirlos.</span>
          </span>
          <span className="ml-auto text-sm font-semibold text-[var(--brand-primary)]">Ver</span>
        </a>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#faf8fd] px-4 py-3 text-sm text-[var(--foreground)]/65">
          {emptyText}
        </p>
      )}
    </section>
  );
}
