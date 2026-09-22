import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Building2, CircleCheck, ClipboardList, TrendingUp, Users } from "lucide-react";
import { getSessionWithUser } from "@/lib/session";
import { ccaaLabel } from "@/lib/spain-ccaa";
import { sectorLabel } from "@/lib/valuation-sectors";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ synced?: string }>;
}) {
  const session = await getSessionWithUser();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const params = await searchParams;
  const syncedCount = params.synced;

  const totalCompanies = await prisma.company.count();
  const publishedOnWeb = await prisma.deal.count({
    where: { published: true },
  });
  const inProcess = await prisma.company.count({
    where: { status: "IN_PROCESS" },
  });

  const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    where: { deletedAt: null },
    _count: true,
  });
  const buyers = usersByRole.find((r) => r.role === "BUYER")?._count ?? 0;
  const sellers = usersByRole.find((r) => r.role === "SELLER")?._count ?? 0;
  const admins = usersByRole.find((r) => r.role === "ADMIN")?._count ?? 0;
  const professionals = usersByRole.find((r) => r.role === "PROFESSIONAL")?._count ?? 0;

  const bySector = await prisma.company.groupBy({
    by: ["sector"],
    _count: true,
    orderBy: { _count: { sector: "desc" } },
    take: 6,
  });

  const byLocation = await prisma.company.groupBy({
    by: ["location"],
    _count: true,
    orderBy: { _count: { location: "desc" } },
    take: 6,
  });

  const staleBefore = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const [valuationLeadsCount, contactLeadsCount, actionsCount, openRequests, staleRequests] = await Promise.all([
    prisma.valuationLead.count(),
    prisma.contactRequest.count(),
    prisma.userCompanyInterest.count({ where: { type: "REQUEST_INFO" } }),
    prisma.userCompanyInterest.count({
      where: { type: "REQUEST_INFO", status: { in: ["PENDING_NDA", "IN_REVIEW", "PENDING"] } },
    }),
    prisma.userCompanyInterest.count({
      where: {
        type: "REQUEST_INFO",
        status: "IN_REVIEW",
        statusUpdatedAt: { lt: staleBefore },
      },
    }),
  ]);
  const leadsCount = valuationLeadsCount + contactLeadsCount;

  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Panel</p>
        <h1 className="mt-1 text-[1.65rem] font-bold tracking-tight text-[var(--brand-dark)]">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/70">
          Visión global del marketplace: usuarios, empresas, leads y solicitudes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Usuarios"
          value={totalUsers}
          subtitle={`${buyers} compradores · ${sellers} vendedores · ${professionals} profesionales · ${admins} admin`}
          href="/admin/users"
          icon={Users}
        />
        <KpiCard
          title="Empresas totales"
          value={totalCompanies}
          subtitle={`${publishedOnWeb} visibles en la web · ${inProcess} en cartera interna`}
          href="/admin/companies"
          icon={Building2}
        />
        <KpiCard
          title="Visibles en la web"
          value={publishedOnWeb}
          subtitle="Deals publicados en el marketplace"
          href="/admin/companies?marketplace=1"
          icon={CircleCheck}
          tone="green"
        />
        <KpiCard
          title="Solicitudes"
          value={actionsCount}
          subtitle="Solicitudes de información acumuladas"
          badge={openRequests > 0 ? `${openRequests} pendientes` : undefined}
          href="/admin/actions"
          icon={ClipboardList}
        />
        <KpiCard
          title="Leads"
          value={leadsCount}
          subtitle="Valoraciones y contacto"
          href="/admin/leads"
          icon={TrendingUp}
        />
        {staleRequests > 0 ? (
          <div className="flex h-full flex-col justify-between rounded-2xl bg-[#f3e8ff] p-5">
            <p className="text-sm font-medium leading-snug text-[var(--brand-dark)]">
              {staleRequests} solicitud{staleRequests === 1 ? "" : "es"} llevan más de 48h sin gestionar
            </p>
            <Link
              href="/admin/actions"
              className="mt-6 inline-flex w-fit rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Ir a Acciones →
            </Link>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-950">
            <p className="font-semibold">Solicitudes al día</p>
            <p className="mt-1 text-emerald-900/80">No hay solicitudes en revisión con más de 48 horas de espera.</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankCard title="Empresas por sector" rows={bySector.map((item) => ({ key: item.sector, label: prettySector(item.sector), count: item._count }))} />
        <RankCard title="Empresas por ubicación" rows={byLocation.map((item) => ({ key: item.location, label: prettyLocation(item.location), count: item._count }))} />
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-[var(--brand-dark)]">Acciones rápidas</h2>
        {syncedCount !== undefined && (
          <p className="mt-3 text-sm font-medium text-emerald-700">
            {syncedCount === "0"
              ? "No había empresas con estado Publicado para sincronizar."
              : `${syncedCount} empresa(s) sincronizada(s): ya visible(s) en la web.`}
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ActionGroup label="Empresas">
            <Link href="/admin/companies" className={primaryPill}>Gestionar empresas</Link>
            <form action="/api/admin/company/sync-published?redirect=1" method="POST">
              <button type="submit" className={mintPill}>Sincronizar con la web</button>
            </form>
            <Link href="/companies" className={quietPill}>Ver listado público</Link>
          </ActionGroup>
          <ActionGroup label="Solicitudes y leads">
            <Link href="/admin/actions" className={primaryPill}>Ver solicitudes de información</Link>
            <Link href="/admin/leads" className={quietPill}>Ver leads (valoraciones y contacto)</Link>
          </ActionGroup>
          <ActionGroup label="Usuarios">
            <Link href="/admin/users" className={primaryPill}>Crear usuarios / admins</Link>
            <Link href="/admin/users" className={quietPill}>Ver todos los usuarios</Link>
          </ActionGroup>
        </div>
      </section>
    </main>
  );
}

const primaryPill =
  "block w-full rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90";
const mintPill =
  "block w-full rounded-full bg-[var(--brand-accent)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--brand-dark)] hover:opacity-90";
const quietPill =
  "block w-full rounded-full bg-[#f3f2f5] px-4 py-2.5 text-center text-sm font-semibold text-[var(--brand-dark)]/80 hover:bg-[#eceaf0]";

function prettySector(value: string) {
  return sectorLabel(value)
    .replace(" (histórico)", "")
    .replace(" / ", " y ");
}

function prettyLocation(value: string) {
  const short: Record<string, string> = {
    madrid: "Madrid",
    murcia: "Murcia",
    valencia: "Valencia",
    andalucia: "Andalucía",
    cataluna: "Cataluña",
  };
  return short[value] ?? ccaaLabel(value);
}

function KpiCard({
  title,
  value,
  subtitle,
  href,
  badge,
  icon: Icon,
  tone = "purple",
}: {
  title: string;
  value: number;
  subtitle?: string;
  href?: string;
  badge?: string;
  icon: LucideIcon;
  tone?: "purple" | "green";
}) {
  const content = (
    <div className="flex h-full flex-col rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-[#f3e8ff] text-[var(--brand-primary)]"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        {badge && (
          <span className="rounded-full bg-[#f8e7b0] px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6a12]">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--brand-dark)]/55">{title}</p>
      <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--brand-dark)]">{value}</p>
      {subtitle && <p className="mt-2 text-xs leading-relaxed text-[var(--brand-dark)]/45">{subtitle}</p>}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block h-full no-underline">
        {content}
      </Link>
    );
  }
  return content;
}

function RankCard({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; count: number }[];
}) {
  return (
    <section className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <h2 className="text-[15px] font-semibold text-[var(--brand-dark)]">{title}</h2>
      <ul className="mt-3">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between border-b border-black/[0.05] py-3 text-sm last:border-0"
          >
            <span className="text-[var(--brand-dark)]/80">{row.label}</span>
            <span className="font-medium text-[var(--brand-dark)]/70">{row.count}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-3 text-sm text-[var(--foreground)]/60">Sin datos aún</li>}
      </ul>
    </section>
  );
}

function ActionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-dark)]/40">{label}</p>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
