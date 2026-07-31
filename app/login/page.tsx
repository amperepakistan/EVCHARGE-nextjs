import { Suspense } from 'react';
import { LoginForm } from '@/components/features/auth/login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 mb-8 text-sm text-black/60">Vendor, owner, and admin access.</p>
      <Suspense fallback={<p className="text-sm text-black/50">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
