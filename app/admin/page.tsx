import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionWithUser } from "@/lib/session";

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

  const [valuationLeadsCount, contactLeadsCount, actionsCount] = await Promise.all([
    prisma.valuationLead.count(),
    prisma.contactRequest.count(),
    prisma.userCompanyInterest.count({ where: { type: "REQUEST_INFO" } }),
  ]);
  const leadsCount = valuationLeadsCount + contactLeadsCount;

  return (
    <main className="max-w-6xl mx-auto">
      <div className="panel-hero mb-8">
        <span className="page-eyebrow">Panel</span>
        <h1 className="mt-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--brand-primary)] via-[#a855f7] to-[var(--brand-dark)] bg-clip-text text-transparent">
          Panel de administración
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
          Visión global del marketplace: usuarios, empresas, leads y solicitudes de información. Desde aquí puedes publicar empresas en la web, sincronizar el listado y acceder a cada sección del panel.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
          Las empresas solo son visibles en el marketplace cuando las publicas desde su ficha en Empresas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Usuarios"
          value={totalUsers}
          subtitle={`${buyers} compradores · ${sellers} vendedores · ${professionals} profesionales · ${admins} admin`}
          href="/admin/users"
          bar="primary"
        />
        <KpiCard
          title="Empresas totales"
          value={totalCompanies}
          href="/admin/companies"
          bar="primary"
        />
        <KpiCard
          title="Visibles en la web"
          value={publishedOnWeb}
          subtitle="Deals publicados en marketplace"
          href="/admin/companies?marketplace=1"
          bar="mint"
        />
        <KpiCard
          title="En revisión"
          value={inProcess}
          subtitle="Estado interno"
          href="/admin/companies?status=IN_PROCESS"
          bar="lavender"
        />
        <KpiCard
          title="Acciones"
          value={actionsCount}
          subtitle="Solicitudes de información"
          href="/admin/actions"
          bar="soft"
        />
        <KpiCard
          title="Leads"
          value={leadsCount}
          subtitle="Valoraciones y contacto"
          href="/admin/leads"
          bar="primary"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AdminSectionCard title="Empresas por sector">
          <ul className="space-y-3">
            {bySector.map((item) => (
              <li
                key={item.sector}
                className="flex justify-between items-center text-sm text-[var(--foreground)] border-b border-[var(--brand-primary)]/5 pb-2 last:border-0 last:pb-0"
              >
                <span>{item.sector}</span>
                <span className="font-semibold text-[var(--brand-primary)]">
                  {item._count}
                </span>
              </li>
            ))}
            {bySector.length === 0 && (
              <li className="text-sm text-[var(--foreground)] opacity-70">
                Sin datos aún
              </li>
            )}
          </ul>
        </AdminSectionCard>
        <AdminSectionCard title="Empresas por ubicación">
          <ul className="space-y-3">
            {byLocation.map((item) => (
              <li
                key={item.location}
                className="flex justify-between items-center text-sm text-[var(--foreground)] border-b border-[var(--brand-primary)]/5 pb-2 last:border-0 last:pb-0"
              >
                <span>{item.location}</span>
                <span className="font-semibold text-[var(--brand-primary)]">
                  {item._count}
                </span>
              </li>
            ))}
            {byLocation.length === 0 && (
              <li className="text-sm text-[var(--foreground)] opacity-70">
                Sin datos aún
              </li>
            )}
          </ul>
        </AdminSectionCard>
      </div>

      <AdminSectionCard title="Acciones rápidas" className="mt-10">
        {syncedCount !== undefined && (
          <p className="mb-4 text-sm text-green-700 font-medium">
            {syncedCount === "0"
              ? "No había empresas con estado Publicado para sincronizar."
              : `${syncedCount} empresa(s) sincronizada(s): ya visible(s) en la web.`}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <form
            action="/api/admin/company/sync-published?redirect=1"
            method="POST"
            className="contents"
          >
            <button
              type="submit"
              className="rounded-full px-6 py-3.5 text-sm font-semibold text-[var(--brand-dark)] shadow-md transition hover:opacity-95"
              style={{
                background: "linear-gradient(135deg, var(--brand-accent) 0%, #c8e87a 100%)",
              }}
            >
              Sincronizar publicadas con la web
            </button>
          </form>
          <Link href="/admin/companies" className="btn-primary">
            Gestionar empresas
          </Link>
          <Link href="/admin/users" className="btn-primary">
            Crear usuarios / Admins
          </Link>
          <Link href="/companies" className="btn-secondary">
            Ver listado público
          </Link>
          <Link href="/admin/actions" className="btn-primary">
            Ver solicitudes de información
          </Link>
          <Link href="/admin/leads" className="btn-primary">
            Ver leads (valoraciones y contacto)
          </Link>
        </div>
      </AdminSectionCard>
    </main>
  );
}

const BAR_CLASS = {
  primary: "admin-card-bar",
  mint: "admin-card-bar admin-card-bar--mint",
  lavender: "admin-card-bar admin-card-bar--lavender",
  soft: "admin-card-bar admin-card-bar--soft",
} as const;

function KpiCard({
  title,
  value,
  subtitle,
  href,
  bar,
}: {
  title: string;
  value: number;
  subtitle?: string;
  href?: string;
  bar: keyof typeof BAR_CLASS;
}) {
  const content = (
    <div className={`admin-card ${href ? "cursor-pointer" : ""}`}>
      <div className={BAR_CLASS[bar]} aria-hidden />
      <div className="admin-card-body">
        <p className="text-sm font-medium text-[var(--brand-dark)]/75">{title}</p>
        <p className="mt-2 text-2xl sm:text-3xl font-bold bg-gradient-to-br from-[var(--brand-primary)] to-[#6b21a8] bg-clip-text text-transparent">
          {value}
        </p>
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-[var(--foreground)] opacity-70 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
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

function AdminSectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card ${className}`}>
      <div className="admin-card-bar" aria-hidden />
      <div className="admin-card-body">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}
