import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { loadServiciosContext } from "@/lib/servicios-panel-data";
import { DILIGENZ_SL_FEE, SL_THIRD_PARTY } from "@/lib/servicios-panel";

export default async function ServiciosFacturacionPage() {
  const session = await getSessionWithUser();
  if (!session) redirect("/login");
  const { constitucion } = await loadServiciosContext(session.user.id, session.user.email);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/dashboard/servicios/constitucion" className="text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]">Mi servicio</Link>
        <Link href="/dashboard/servicios/documentos" className="text-[var(--foreground)]/55 hover:text-[var(--brand-dark)]">Documentos</Link>
        <span className="font-semibold text-[var(--brand-primary)]">Facturación</span>
      </div>
      <h1 className="text-2xl font-extrabold text-[var(--brand-dark)]">Facturación</h1>
      <section className="rounded-3xl border border-[#ece6f5] bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">Honorarios Diligenz</p>
        <p className="mt-2 text-sm text-[var(--foreground)]/65">
          {constitucion
            ? "Constitución de sociedad limitada · tramitación completa, de principio a fin."
            : "Todavía no hay un servicio contratado."}
        </p>
        {constitucion ? (
          <p className="mt-3 text-3xl font-extrabold text-[var(--brand-primary)]">{DILIGENZ_SL_FEE}</p>
        ) : null}
      </section>
      {constitucion ? (
        <section className="rounded-3xl border border-[#ece6f5] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]/45">
            Gastos de gestión y terceros
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {SL_THIRD_PARTY.map((row) => (
              <li key={row.label} className="flex justify-between gap-3">
                <span className="text-[var(--foreground)]/70">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--foreground)]/50">
            Estos importes son de notaría, registro y otros organismos. No forman parte de los 300 € + IVA de Diligenz.
          </p>
        </section>
      ) : null}
    </div>
  );
}
