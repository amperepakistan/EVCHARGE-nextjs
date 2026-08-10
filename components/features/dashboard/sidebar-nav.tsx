'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  Handshake,
  LayoutDashboard,
  LogOut,
  MapPinned,
  ReceiptText,
  ShieldAlert,
  Store,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import type { UserRole } from '@/types/database.types';
import { cn } from '@/lib/utils/cn';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VENDOR_LINKS: NavLink[] = [
  { href: '/vendor', label: 'Overview', icon: LayoutDashboard },
  { href: '/vendor/chargers', label: 'Chargers', icon: Zap },
  { href: '/vendor/faults', label: 'Faults', icon: ShieldAlert },
  { href: '/vendor/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/vendor/customers', label: 'Customers', icon: Handshake },
  { href: '/vendor/opportunities', label: 'Opportunities', icon: MapPinned },
  { href: '/vendor/revenue', label: 'Business', icon: ReceiptText },
  { href: '/vendor/team', label: 'Team', icon: Users },
];

const OWNER_LINKS: NavLink[] = [
  { href: '/owner', label: 'Overview', icon: LayoutDashboard },
  { href: '/owner/sites', label: 'My sites', icon: Building2 },
  { href: '/owner/sessions', label: 'Sessions', icon: CalendarClock },
  { href: '/owner/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/owner/revenue', label: 'Revenue', icon: ReceiptText },
  { href: '/owner/security', label: 'Site security', icon: ShieldAlert },
  { href: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/owner/opportunities', label: 'Expansion', icon: MapPinned },
  { href: '/owner/vendors', label: 'Vendors', icon: Store },
];

const ADMIN_LINKS: NavLink[] = [
  { href: '/admin', label: 'Console', icon: Activity },
  { href: '/admin/drivers', label: 'Drivers', icon: Users },
  { href: '/admin/vendors', label: 'Vendors', icon: Store },
  { href: '/admin/owners', label: 'Owners', icon: Building2 },
  { href: '/admin/chargers', label: 'Chargers', icon: Zap },
  { href: '/admin/sessions', label: 'Sessions', icon: CalendarClock },
];

const LINKS: Partial<Record<UserRole, NavLink[]>> = {
  vendor: VENDOR_LINKS,
  owner: OWNER_LINKS,
  super_admin: ADMIN_LINKS,
  staff: ADMIN_LINKS,
};

interface SidebarNavProps {
  role: UserRole;
  /** When a platform admin is drilled into a tenant, show that tenant's nav. */
  navRole?: UserRole;
  userName: string;
  organisation: string;
  logout: () => Promise<void>;
}

export function SidebarNav({
  role,
  navRole,
  userName,
  organisation,
  logout,
}: SidebarNavProps) {
  const pathname = usePathname();
  const effectiveRole = navRole ?? role;
  const links = LINKS[effectiveRole] ?? [];

  return (
    <aside className="bg-ink text-on-ink flex w-full shrink-0 flex-col lg:h-screen lg:w-64 lg:sticky lg:top-0">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="bg-primary text-on-primary rounded-image flex size-8 items-center justify-center">
          <Zap className="size-4.5" />
        </span>
        <span className="font-heading text-on-ink text-lg font-bold tracking-tight">
          Ampere
        </span>
      </div>

      <nav className="flex-1 px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/admin'
                ? pathname === '/admin'
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-primary text-on-primary'
                      : 'text-on-ink/65 hover:bg-on-ink/8 hover:text-on-ink',
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-on-ink/10 mt-auto border-t px-3 py-4">
        <div className="px-2 pb-3">
          <p className="text-on-ink truncate text-sm font-semibold">{userName}</p>
          <p className="text-on-ink/50 truncate text-xs">{organisation}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-button text-on-ink/65 hover:bg-on-ink/8 hover:text-on-ink flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors"
          >
            <LogOut className="size-4.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
