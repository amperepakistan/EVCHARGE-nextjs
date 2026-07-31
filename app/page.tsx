import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6">
      <div>
        <p className="text-sm font-medium tracking-wide text-[var(--accent)] uppercase">EVCharge</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Network control plane</h1>
        <p className="mt-3 max-w-xl text-base text-black/70">
          Vendor, owner, and super-admin dashboards. The Flutter driver app talks to{' '}
          <code className="rounded bg-black/5 px-1.5 py-0.5 text-sm">/api/*</code>.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Sign in
        </Link>
        <Link
          href="/vendor"
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
        >
          Vendor dashboard
        </Link>
        <Link
          href="/owner"
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
        >
          Owner dashboard
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
        >
          Admin console
        </Link>
      </div>
    </main>
  );
}
