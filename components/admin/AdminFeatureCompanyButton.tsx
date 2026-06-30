type Props = {
  companyId: string;
  published: boolean;
  featuredActive: boolean;
  returnTo?: string;
  className?: string;
};

export default function AdminFeatureCompanyButton({
  companyId,
  published,
  featuredActive,
  returnTo = "/admin/companies",
  className = "",
}: Props) {
  if (!published) return null;

  return (
    <form action="/api/admin/company/feature" method="POST" className={`inline ${className}`.trim()}>
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition ${
          featuredActive ? "bg-amber-600" : "bg-[var(--brand-primary)]"
        }`}
      >
        {featuredActive ? "Quitar destacado" : "Destacar"}
      </button>
    </form>
  );
}
