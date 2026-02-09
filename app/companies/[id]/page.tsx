import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShellLayout from "@/components/layout/ShellLayout";
import { MOCK_COMPANIES } from "@/lib/mock-companies";
import { prisma } from "@/lib/prisma";
import CompanyFicha from "./CompanyFicha";
import type { CompanyMock } from "@/lib/mock-companies";

type Props = { params: Promise<{ id: string }> };

async function getCompanyById(id: string): Promise<CompanyMock | null> {
  const mock = MOCK_COMPANIES.find((c) => c.id === id);
  if (mock) return mock;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      deals: { where: { published: true }, take: 1 },
      valuations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!company || company.deals.length === 0) return null;

  const val = company.valuations[0];
  const revenueStr = val
    ? `${(val.minValue / 1_000_000).toFixed(1)}–${(val.maxValue / 1_000_000).toFixed(1)}M €`
    : "—";
  return {
    id: company.id,
    name: company.name,
    sector: company.sector,
    location: company.location,
    revenue: revenueStr,
    ebitda: company.ebitda ?? "—",
    description: company.description ?? "Sin descripción.",
  };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const isLoggedIn = Boolean(session?.value);

  return (
    <ShellLayout>
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/companies"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            ← Volver a empresas
          </Link>
          <CompanyFicha company={company} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </ShellLayout>
  );
}
