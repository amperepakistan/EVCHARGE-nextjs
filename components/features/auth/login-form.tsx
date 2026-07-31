'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    startTransition(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = (await res.json()) as {
        data: { user: { role: string } } | null;
        error: string | null;
      };

      if (!res.ok || json.error || !json.data) {
        setError(json.error ?? 'Login failed');
        return;
      }

      const next = searchParams.get('next');
      const roleHome: Record<string, string> = {
        vendor: '/vendor',
        owner: '/owner',
        super_admin: '/admin',
        staff: '/admin',
        driver: '/',
      };

      router.replace(next ?? roleHome[json.data.user.role] ?? '/');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField label="Email" name="email" type="email" required autoComplete="email" />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
