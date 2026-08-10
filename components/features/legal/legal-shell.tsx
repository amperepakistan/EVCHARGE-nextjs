import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { SiteFooter } from '@/components/ui/site-footer';
import { EFFECTIVE_DATE } from '@/lib/legal/config';

/**
 * Chrome shared by `/privacy` and `/terms`.
 *
 * The project has no `@tailwindcss/typography` plugin, so the prose primitives
 * below carry the type scale instead of a `prose` class.
 */

interface LegalShellProps {
  title: string;
  summary: string;
  sections: { id: string; title: string }[];
  children: React.ReactNode;
}

export function LegalShell({ title, summary, sections, children }: LegalShellProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <nav className="border-border border-b px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
          <Link
            href="/"
            className="text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:px-10 md:py-16">
        <h1 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-text-secondary mt-3 text-sm">
          Effective {EFFECTIVE_DATE}
        </p>
        <p className="text-text-secondary mt-6 text-lg leading-relaxed">{summary}</p>

        <nav
          aria-label="On this page"
          className="rounded-card bg-surface-muted mt-10 p-5"
        >
          <h2 className="text-text-secondary text-xs font-bold tracking-wider uppercase">
            On this page
          </h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id} className="text-sm">
                <a
                  href={`#${section.id}`}
                  className="text-text-secondary hover:text-primary-800 transition-colors"
                >
                  <span className="tabular-nums">{index + 1}.</span> {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12">{children}</div>
      </main>

      <SiteFooter maxWidth="max-w-4xl" />
    </div>
  );
}

export function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-border border-t py-8 first:border-t-0 first:pt-0">
      <h2 className="font-heading text-text-primary text-xl font-bold tracking-tight">
        <span className="text-text-secondary tabular-nums">{index}.</span> {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-text-secondary leading-relaxed">{children}</p>;
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-text-primary pt-2 text-base font-bold">{children}</h3>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="text-text-secondary space-y-2 leading-relaxed">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="bg-primary-400 mt-2 size-1.5 shrink-0 rounded-full" />
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** For clauses a user genuinely needs to read — not decoration. */
export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-ink text-on-ink p-5">
      <p className="text-on-ink/60 text-xs font-bold tracking-wide uppercase">{title}</p>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/** Definition-style rows used for the data tables in the privacy policy. */
export function DataTable({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="rounded-card border-border overflow-hidden border">
      <dl className="divide-border divide-y">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 p-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-text-primary text-sm font-bold">{row.label}</dt>
            <dd className="text-text-secondary text-sm leading-relaxed sm:col-span-2">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
