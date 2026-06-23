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
      <section className="relative px-4 py-10 text-center sm:px-6 md:py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="page-title">{config.h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--foreground)]/75 sm:text-base">
            {config.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {config.ctas.map((cta) =>
              cta.primary ? (
                <Link key={cta.href} href={cta.href} className="btn-primary">
                  {cta.label}
                </Link>
              ) : (
                <Link key={cta.href} href={cta.href} className="btn-secondary">
                  {cta.label}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-12 sm:px-6 md:pb-16">
        {config.sections.map((section) => (
          <section key={section.title} className="page-card page-card-padded">
            <h2 className="text-lg font-bold text-[var(--brand-dark)] sm:text-xl">
              {section.title}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p
                key={i}
                className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/75 sm:text-base"
              >
                {p}
              </p>
            ))}
          </section>
        ))}

        {config.relatedLinks && config.relatedLinks.length > 0 && (
          <nav className="page-card page-card-padded" aria-label="Enlaces relacionados">
            <h2 className="mb-3 text-lg font-bold text-[var(--brand-dark)]">
              También te puede interesar
            </h2>
            <ul className="space-y-2 text-sm">
              {config.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium text-[var(--brand-primary)] hover:underline"
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
    </ShellLayout>
  );
}
