import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import { SITE_URL, getBreadcrumbSchema } from "@/lib/seo";

export type SeoLandingSection = {
  title: string;
  paragraphs: string[];
};

export type SeoLandingCta = {
  label: string;
  href: string;
  primary?: boolean;
};

export type SeoLandingConfig = {
  slug: string;
  breadcrumbLabel: string;
  h1: string;
  subtitle: string;
  sections: SeoLandingSection[];
  ctas: SeoLandingCta[];
  relatedLinks?: { label: string; href: string }[];
};

type Props = {
  config: SeoLandingConfig;
  children?: React.ReactNode;
};

export default function SeoLanding({ config, children }: Props) {
  const pageUrl = `${SITE_URL}/${config.slug}`;
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Inicio", url: SITE_URL },
    { name: config.breadcrumbLabel, url: pageUrl },
  ]);

  return (
    <ShellLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <section className="border-b border-[var(--brand-primary)]/10 bg-[var(--brand-bg)] py-8 md:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--brand-primary)]">
              {config.h1}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {config.ctas.map((cta) =>
                cta.primary ? (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold bg-[var(--brand-primary)] text-white shadow-lg hover:opacity-95 transition"
                  >
                    {cta.label}
                  </Link>
                ) : (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold border-2 border-[var(--brand-primary)]/40 text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-primary)]/10 transition"
                  >
                    {cta.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-6">
          {config.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-8 shadow-md"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
                {section.title}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}

          {config.relatedLinks && config.relatedLinks.length > 0 && (
            <nav
              className="rounded-2xl border border-[var(--brand-primary)]/10 bg-white p-6 md:p-8 shadow-md"
              aria-label="Enlaces relacionados"
            >
              <h2 className="text-lg font-bold text-[var(--brand-primary)] mb-3">
                También te puede interesar
              </h2>
              <ul className="space-y-2 text-sm">
                {config.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--brand-primary)] font-medium hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {children}
      </div>
    </ShellLayout>
  );
}
