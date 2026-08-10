import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/features/auth/login-form';
import { BrandLogo } from '@/components/ui/brand-logo';
import { SiteFooter } from '@/components/ui/site-footer';
import { CONTACT } from '@/lib/legal/config';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-12 bg-[var(--color-background)]">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <BrandLogo size="md" />
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          ← Back to Network Overview
        </Link>
      </header>

      {/* Login Card Section */}
      <div className="my-auto py-12 flex justify-center">
        <div className="w-full max-w-md card-rounded bg-[var(--color-surface)] border border-[var(--color-border)] p-8 md:p-10 shadow-sm">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Sign in to manage vendor stations, fleet operations, and platform analytics.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-40 items-center justify-center text-sm text-[var(--color-text-secondary)]">
                Loading sign in form…
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-center">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Need platform access or technical support?{' '}
              <a
                href={`mailto:${CONTACT.support}`}
                className="font-medium text-[var(--color-text-primary)] underline"
              >
                Contact Administrator
              </a>
            </p>
          </div>
        </div>
      </div>

      <SiteFooter showLogo={false} className="w-full border-t-0" />
    </main>
  );
}
