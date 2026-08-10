import Link from 'next/link';
import { ArrowRight, Building2, ShieldCheck, Wrench, Zap } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';

const PORTALS = [
  {
    href: '/vendor',
    icon: Wrench,
    title: 'Vendor',
    description:
      'Charger health, faults, remote operations and maintenance across everything you install.',
  },
  {
    href: '/owner',
    icon: Building2,
    title: 'Terminal Owner',
    description:
      'Your site: live bay status, revenue share, sessions, and on-premise security.',
  },
  {
    href: '/admin',
    icon: ShieldCheck,
    title: 'Admin Console',
    description: 'Network-wide oversight, tenants, pricing models and platform RBAC.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <nav className="border-border border-b px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo size="md" />
          <Link
            href="/login"
            className="rounded-button bg-primary text-on-primary hover:bg-primary-dark flex h-10 items-center px-5 text-sm font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <span className="rounded-tag bg-primary-light text-primary-800 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wide uppercase">
              <Zap className="size-3.5" />
              Pakistan EV network
            </span>

            <h1 className="font-heading text-text-primary mt-6 text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One console for every
              <br />
              charger you run.
            </h1>

            <p className="text-text-secondary mt-6 max-w-xl text-lg leading-relaxed">
              Ampere connects vendors, site owners and operators to the same live data —
              charger health, sessions, faults and revenue, from install to payout.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-button bg-primary text-on-primary hover:bg-primary-dark flex h-12 items-center gap-2 px-6 text-sm font-semibold transition-colors"
              >
                Sign in to console
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#portals"
                className="rounded-button border-border text-text-primary hover:bg-surface-muted flex h-12 items-center border px-6 text-sm font-semibold transition-colors"
              >
                Explore portals
              </a>
            </div>

            <dl className="border-border mt-12 grid max-w-lg grid-cols-3 gap-6 border-t pt-8">
              {[
                { value: '12', label: 'Live stations' },
                { value: '6', label: 'Cities' },
                { value: '99.2%', label: 'Network uptime' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-heading text-text-primary text-2xl font-bold tracking-tight">
                    {stat.value}
                  </dt>
                  <dd className="text-text-secondary mt-0.5 text-xs">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="portals" className="flex flex-col gap-3 lg:col-span-6">
            <h2 className="text-text-secondary px-1 text-xs font-bold tracking-wider uppercase">
              Select your portal
            </h2>

            {PORTALS.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={href}
                href={href}
                className="rounded-card border-border hover:border-primary-400 group border p-5 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="rounded-image bg-surface-muted text-primary-800 group-hover:bg-primary-light flex size-11 shrink-0 items-center justify-center transition-colors">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-heading text-text-primary text-base font-bold">
                        {title}
                      </h3>
                      <ArrowRight className="text-text-secondary size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            <div className="rounded-card bg-ink text-on-ink mt-2 p-5">
              <p className="text-on-ink/60 text-xs font-bold tracking-wide uppercase">
                Demo build
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Every dashboard runs on sample data — no live chargers are connected.
                Sign in with any demo account to explore.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-border border-t px-6 py-6 md:px-10">
        <div className="text-text-secondary mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs md:flex-row">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Ampere. EV charging infrastructure for Pakistan.</p>
        </div>
      </footer>
    </div>
  );
}
