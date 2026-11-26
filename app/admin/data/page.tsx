import { redirect } from "next/navigation";
import { getSessionWithUser } from "@/lib/session";
import { loadAdminData, type RankBlock } from "@/lib/admin-data";
import { GroupedBars } from "@/components/admin/GroupedBars";
import {
  BreakdownCard,
  DailyUsers,
  KpiCard,
  PageList,
  Section,
  formatDuration,
  formatInt,
  pipelineSeries,
  registrationSeries,
} from "@/components/admin/DataVisuals";

export const dynamic = "force-dynamic";

export default async function AdminDataPage() {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const data = await loadAdminData();
  const { summary, registrations, pipeline, demographics, traffic } = data;

  const blocks: { title: string; hint: string; block: NonNullable<RankBlock> }[] = [];
  if (demographics.roles) {
    blocks.push({ title: "Por rol", hint: "Cuentas que siguen de alta", block: demographics.roles });
  }
  if (demographics.locations) {
    blocks.push({
      title: "Por ubicación",
      hint: "Comunidad autónoma de la empresa",
      block: demographics.locations,
    });
  }
  if (demographics.sectors) {
    blocks.push({ title: "Por sector", hint: "Sector declarado en la empresa", block: demographics.sectors });
  }
  if (demographics.companyTypes) {
    blocks.push({
      title: "Por tipo de operación",
      hint: "Tipo guardado en la empresa",
      block: demographics.companyTypes,
    });
  }

  const serviceDetail = pipeline.services.statuses
    .map((row) => `${formatInt(row.count)} ${row.label.toLowerCase()}`)
    .join(" · ");

  return (
    <main className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Panel</p>
        <h1 className="mt-1 text-[1.65rem] font-bold tracking-tight text-[var(--brand-dark)]">Data</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--foreground)]/70">
          Números para decidir: altas, demanda y uso de la web. Los meses siguen el calendario de Madrid. Nada de esta
          página se envía a Google.
        </p>
      </div>

      <Section kicker="Resumen" title="Cifras clave">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Usuarios"
            value={summary.users}
            subtitle={`${formatInt(summary.newUsersThisMonth)} nuevos este mes · ${formatInt(summary.admins)} administradores`}
            href="/admin/users"
          />
          <KpiCard title="Compradores" value={summary.buyers} subtitle="Cuentas con rol comprador" href="/admin/users" />
          <KpiCard title="Vendedores" value={summary.sellers} subtitle="Cuentas con rol vendedor" href="/admin/users" />
          <KpiCard
            title="Profesionales"
            value={summary.professionals}
            subtitle="Cuentas con rol profesional"
            href="/admin/users"
          />
          <KpiCard
            title="Leads de valoración"
            value={summary.valuations}
            subtitle={`${formatInt(pipeline.valuations.thisMonth)} este mes`}
            href="/admin/leads"
          />
          <KpiCard
            title="Solicitudes de contacto"
            value={summary.contacts}
            subtitle={`${formatInt(pipeline.contacts.thisMonth)} este mes`}
            href="/admin/leads"
          />
          <KpiCard
            title="Acciones"
            value={summary.actions}
            subtitle={`${formatInt(pipeline.actions.thisMonth)} solicitudes de información este mes`}
            href="/admin/actions"
          />
          <KpiCard
            title="Servicios"
            value={summary.services}
            subtitle={`${formatInt(pipeline.services.thisMonth)} expedientes este mes · ${formatInt(summary.serviceInquiries)} consultas del formulario`}
            href="/admin/servicios"
          />
        </div>
      </Section>

      <Section
        kicker="Altas"
        title="Registros de usuarios por mes"
        intro="Últimos 12 meses. Compradores, vendedores y profesionales van en colores distintos. Los administradores cuentan en el total y no en las barras."
      >
        <GroupedBars
          caption="Registros por mes"
          series={registrationSeries}
          rows={registrations.months.map((month) => ({
            id: month.key,
            label: month.label,
            values: [month.buyers, month.sellers, month.professionals],
          }))}
          empty="Sin altas de compradores, vendedores o profesionales en los últimos 12 meses."
        />
      </Section>

      <Section
        kicker="Demanda"
        title="Leads, contactos y servicios"
        intro="La valoración sale del formulario de valorar empresa. El contacto, del formulario general. Las consultas de servicios son los envíos de ese formulario. Los expedientes ya asignados a un cliente van en el resumen."
      >
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniStat label="Valoraciones" total={pipeline.valuations.total} month={pipeline.valuations.thisMonth} />
          <MiniStat label="Contacto" total={pipeline.contacts.total} month={pipeline.contacts.thisMonth} />
          <MiniStat
            label="Consultas de servicios"
            total={pipeline.serviceInquiries.total}
            month={pipeline.serviceInquiries.thisMonth}
          />
          <MiniStat
            label="Servicios asignados"
            total={pipeline.services.total}
            month={pipeline.services.thisMonth}
            detail={serviceDetail || undefined}
          />
        </div>
        <GroupedBars
          caption="Tendencia mensual de demanda"
          series={pipelineSeries}
          rows={pipeline.months.map((month) => ({
            id: month.key,
            label: month.label,
            values: [month.valuations, month.contacts, month.serviceInquiries],
          }))}
          empty="Sin valoraciones, contactos ni consultas de servicios en los últimos 12 meses."
        />
      </Section>

      <Section
        kicker="Perfil"
        title="Registro demográfico"
        intro="El usuario solo tiene rol en su perfil. La ubicación, el sector y el tipo de operación salen de las empresas que siguen en cartera. Si un dato no existe, no se muestra."
      >
        {blocks.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/60">
            Todavía no hay roles ni empresas con ubicación, sector o tipo de operación.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {blocks.map((item) => (
              <BreakdownCard
                key={item.title}
                title={item.title}
                hint={item.hint}
                rows={item.block.rows}
                more={item.block.more}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        kicker="Tráfico"
        title="Usuarios distintos por día"
        intro="Una persona con sesión cuenta una vez al día, aunque abra varias páginas. Últimos 14 días."
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            title="Usuarios distintos"
            value={traffic.distinctUsers30}
            subtitle="Con sesión y al menos una página, últimos 30 días"
          />
          <KpiCard
            title="Visitas anónimas"
            value={traffic.anonymousViews30}
            subtitle="Contador agregado, sin usuario. No se suma con las identificadas."
          />
          <KpiCard
            title="Visitas identificadas"
            value={traffic.identifiedViews30}
            subtitle="Páginas abiertas con sesión, últimos 30 días"
          />
        </div>
        <div className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
          {traffic.identifiedReady ? (
            <DailyUsers days={traffic.days} />
          ) : (
            <p className="text-sm text-[var(--foreground)]/60">
              Falta aplicar la migración de vistas de usuario en esta base de datos. Hasta entonces este bloque se queda vacío.
            </p>
          )}
        </div>
      </Section>

      <Section
        kicker="Páginas"
        title="Las más visitadas"
        intro="Últimos 30 días. Son dos listas distintas: el agregado anónimo no sabe quién entró, y las visitas con sesión no reutilizan ese contador."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PageList
            title="Visitas totales anónimas"
            hint="Suma del contador agregado por ruta. Sin persona."
            rows={traffic.anonymousPages}
            empty="Sin visitas anónimas en los últimos 30 días."
          />
          <PageList
            title="Visitas de usuarios identificados"
            hint="Cada apertura con sesión."
            rows={traffic.identifiedPages}
            empty={
              traffic.identifiedReady
                ? "Sin páginas de usuarios con sesión en los últimos 30 días."
                : "Aún no se puede leer: la tabla de vistas identificadas no está en esta base de datos."
            }
          />
        </div>
      </Section>

      <Section
        kicker="Tiempo"
        title="Dónde pasan más tiempo"
        intro="Solo usuarios con sesión. Se mide con la pestaña visible, a partir de 2 segundos y con un máximo de 30 minutos."
      >
        <div className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
          {traffic.timePages.length === 0 ? (
            <p className="text-sm text-[var(--foreground)]/60">
              Todavía no hay tiempo medido. Aparece cuando alguien con sesión sale de una página.
            </p>
          ) : (
            <ul className="space-y-3">
              {traffic.timePages.map((row) => {
                const max = traffic.timePages[0]?.totalMs || 1;
                return (
                  <li key={row.path}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="min-w-0 truncate font-mono text-xs text-[var(--brand-dark)]/80" title={row.path}>
                        {row.path}
                      </span>
                      <span className="shrink-0 text-sm text-[var(--brand-dark)]/70">
                        {formatDuration(row.totalMs)} · media {formatDuration(row.avgMs)} · {formatInt(row.samples)}{" "}
                        {row.samples === 1 ? "estancia" : "estancias"}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f3f2f5]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(row.totalMs / max) * 100}%`, background: "#4d7c0f" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Section>

      <Section
        kicker="Personas"
        title="Usuarios identificados"
        intro="Últimos 30 días. Quién entró, qué páginas repite y cuánto tiempo suma."
      >
        {traffic.people.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/60">Todavía no hay recorrido de usuarios con sesión.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {traffic.people.map((person) => (
              <article
                key={person.userId}
                className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]"
              >
                <h3 className="text-[15px] font-semibold text-[var(--brand-dark)]">{person.name?.trim() || person.email}</h3>
                <p className="mt-1 text-xs text-[var(--brand-dark)]/45">
                  {person.role}
                  {person.name?.trim() ? ` · ${person.email}` : ""} · {formatInt(person.views)}{" "}
                  {person.views === 1 ? "vista" : "vistas"} · {formatDuration(person.durationMs)}
                </p>
                {person.pages.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {person.pages.map((page) => (
                      <li key={page.path} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-mono text-xs text-[var(--brand-dark)]/80" title={page.path}>
                          {page.path}
                        </span>
                        <span className="shrink-0 font-medium text-[var(--brand-dark)]/70">{formatInt(page.views)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}

function MiniStat({
  label,
  total,
  month,
  detail,
}: {
  label: string;
  total: number;
  month: number;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.04] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <p className="text-xs font-medium text-[var(--brand-dark)]/50">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--brand-dark)]">{formatInt(total)}</p>
      <p className="mt-1 text-[11px] text-[var(--brand-dark)]/45">{formatInt(month)} este mes</p>
      {detail && <p className="mt-1 text-[11px] leading-snug text-[var(--brand-dark)]/40">{detail}</p>}
    </div>
  );
}
