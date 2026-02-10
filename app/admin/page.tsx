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
  const draft = await prisma.company.count({
    where: { status: "DRAFT" },
  });

  const totalUsers = await prisma.user.count();
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });
  const buyers = usersByRole.find((r) => r.role === "BUYER")?._count ?? 0;
  const sellers = usersByRole.find((r) => r.role === "SELLER")?._count ?? 0;
  const admins = usersByRole.find((r) => r.role === "ADMIN")?._count ?? 0;

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

  const [valuationLeadsCount, contactLeadsCount] = await Promise.all([
    prisma.valuationLead.count(),
    prisma.contactRequest.count(),
  ]);
  const leadsCount = valuationLeadsCount + contactLeadsCount;

  return (
    <main className="max-w-6xl mx-auto">
      <div className="mb-8">
        <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]/80 mb-2">
          Panel
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)]">
          Panel de administración
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
          Visión global del marketplace: usuarios, empresas, leads y solicitudes de información. Desde aquí puedes publicar empresas en la web, sincronizar el listado y acceder a cada sección del panel.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--foreground)] opacity-75">
          Las empresas solo son visibles en el marketplace cuando las publicas desde su ficha en Empresas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Usuarios"
          value={totalUsers}
          subtitle={`${buyers} compradores · ${sellers} vendedores · ${admins} admin`}
          accent="primary"
        />
        <KpiCard
          title="Empresas totales"
          value={totalCompanies}
          href="/admin/companies"
          accent="primary"
        />
        <KpiCard
          title="Visibles en la web"
          value={publishedOnWeb}
          subtitle="Publicadas en marketplace"
          href="/admin/companies"
          accent="green"
        />
        <KpiCard title="En revisión" value={inProcess} accent="blue" />
        <KpiCard title="Borrador" value={draft} accent="gray" />
        <KpiCard
          title="Leads"
          value={leadsCount}
          subtitle="Valoraciones y contacto"
          href="/admin/leads"
          accent="primary"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Empresas por sector
          </h2>
          <ul className="mt-4 space-y-3">
            {bySector.map((item) => (
              <li
                key={item.sector}
                className="flex justify-between items-center text-sm text-[var(--foreground)]"
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
        </section>
        <section className="rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
            Empresas por ubicación
          </h2>
          <ul className="mt-4 space-y-3">
            {byLocation.map((item) => (
              <li
                key={item.location}
                className="flex justify-between items-center text-sm text-[var(--foreground)]"
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
        </section>
      </div>

      <div className="mt-10 rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6">
        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
          Acciones rápidas
        </h2>
        {syncedCount !== undefined && (
          <p className="mt-2 text-sm text-green-600">
            {syncedCount === "0"
              ? "No había empresas con estado Publicado para sincronizar."
              : `${syncedCount} empresa(s) sincronizada(s): ya visible(s) en la web.`}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <form
            action="/api/admin/company/sync-published?redirect=1"
            method="POST"
            className="contents"
          >
            <button
              type="submit"
              className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-green-600 text-white shadow-lg hover:opacity-95 transition"
            >
              Sincronizar publicadas con la web
            </button>
          </form>
          <Link
            href="/admin/companies"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Gestionar empresas
          </Link>
          <Link
            href="/admin/actions"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Ver solicitudes de información
          </Link>
          <Link
            href="/admin/leads"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Ver leads (valoraciones y contacto)
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
          >
            Crear usuarios / Admins
          </Link>
          <Link
            href="/companies"
            className="rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition"
          >
            Ver listado público
          </Link>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  href,
  accent,
}: {
  title: string;
  value: number;
  subtitle?: string;
  href?: string;
  accent: "primary" | "green" | "blue" | "gray";
}) {
  const styles = {
    primary: "border-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
    green: "border-green-200 text-green-700",
    blue: "border-blue-200 text-blue-700",
    gray: "border-gray-200 text-gray-700",
  };
  const content = (
    <div
      className={`rounded-2xl bg-white border p-6 shadow-md transition hover:shadow-lg ${href ? "cursor-pointer" : ""} ${styles[accent]}`}
    >
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs sm:text-sm opacity-75">{subtitle}</p>
      )}
    </div>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
