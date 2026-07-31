import Link from 'next/link';
import type { UserRole } from '@/types/database.types';
import { logoutAction } from '@/lib/auth/actions';

const LINKS: Partial<Record<UserRole, { href: string; label: string }[]>> = {
  vendor: [
    { href: '/vendor', label: 'Overview' },
    { href: '/vendor/terminals', label: 'Terminals' },
  ],
  owner: [{ href: '/owner', label: 'Overview' }],
  super_admin: [{ href: '/admin', label: 'Console' }],
  staff: [{ href: '/admin', label: 'Console' }],
};

export function DashboardNav({ role }: { role: UserRole }) {
  const links = LINKS[role] ?? [];

  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          EVCharge
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-black/70 hover:text-black">
              {link.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <button type="submit" className="text-black/50 hover:text-black">
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
