import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--color-background)]">
      {/* Top Navbar */}
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="btn-pill h-10 px-5 text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center shadow-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Main Section */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-16 md:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-7">

            <h1 className="font-heading mt-4 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              Powering the future of EV charging.
            </h1>
            
            <p className="mt-6 text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
              Comprehensive portal for vendors, station owners, and network administrators to monitor live telemetry, manage charging hubs, and process driver sessions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="btn-pill h-12 px-6 text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center shadow-sm"
              >
                Sign in to Console →
              </Link>
            </div>
          </div>

          {/* Right Column: Portal Access Cards Grid */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] px-1">
              Select Portal Dashboard
            </h2>

            <Link
              href="/vendor"
              className="card-rounded group border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-heading text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-800)]">
                  Vendor Dashboard
                </div>
                <span className="text-[var(--color-text-secondary)] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Manage station hardware, connector status, dynamic pricing, and uptime diagnostics.
              </p>
            </Link>

            <Link
              href="/owner"
              className="card-rounded group border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-heading text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-800)]">
                  Owner Dashboard
                </div>
                <span className="text-[var(--color-text-secondary)] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Monitor charging revenue, energy consumption metrics, and financial reporting.
              </p>
            </Link>

            <Link
              href="/admin"
              className="card-rounded group border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-heading text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-800)]">
                  Admin Console
                </div>
                <span className="text-[var(--color-text-secondary)] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Super-admin network overrides, user role management, and system-wide audits.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 text-center text-xs text-[var(--color-text-secondary)]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <p>&copy; {new Date().getFullYear()} EV Charging Infrastructure. Built with Design System tokens.</p>
        </div>
      </footer>
    </div>
  );
}
