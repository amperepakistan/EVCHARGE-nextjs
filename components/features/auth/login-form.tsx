'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { demoAccounts } from '@/lib/mock/users';

const ROLE_HOME: Record<string, string> = {
  vendor: '/vendor',
  owner: '/owner',
  super_admin: '/admin',
  staff: '/admin',
  driver: '/',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, startTransition] = useTransition();

  function submit(nextEmail: string, nextPassword: string) {
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });

      const json = (await res.json()) as {
        data: { user: { role: string } } | null;
        error: string | null;
      };

      if (!res.ok || json.error || !json.data) {
        setError(json.error ?? 'Login failed. Please check your credentials.');
        return;
      }

      const next = searchParams.get('next');
      router.replace(next ?? ROLE_HOME[json.data.user.role] ?? '/');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(email, password);
        }}
        className="flex flex-col gap-5"
      >
        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <div className="rounded-button border-error/20 bg-error/5 text-error border p-3.5 text-xs font-medium">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Authenticating…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {/* Demo build: no real user store, so make the sample tenants reachable
          in one click rather than making people copy credentials around. */}
      <div className="border-border border-t pt-5">
        <p className="text-text-secondary text-xs font-bold tracking-wider uppercase">
          Demo accounts
        </p>
        <div className="mt-3 grid gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              disabled={pending}
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                submit(account.email, account.password);
              }}
              className="rounded-button border-border hover:bg-surface-muted flex items-center justify-between gap-3 border px-3.5 py-2.5 text-left transition-colors disabled:opacity-50"
            >
              <span className="min-w-0">
                <span className="text-text-primary block truncate text-sm font-semibold">
                  {account.label}
                </span>
                <span className="text-text-secondary block truncate text-xs">
                  {account.email}
                </span>
              </span>
              <span className="rounded-tag bg-surface-muted text-text-secondary shrink-0 px-2 py-1 text-[10px] font-bold tracking-wide uppercase">
                {account.role.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
