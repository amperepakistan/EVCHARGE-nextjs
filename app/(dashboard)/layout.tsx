import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import {
  getAdminOwnerIdFromCookies,
  getAdminVendorIdFromCookies,
} from '@/lib/auth/admin-scope';
import { logoutAction } from '@/lib/auth/actions';
import { SidebarNav } from '@/components/features/dashboard/sidebar-nav';
import { ImpersonationBanner } from '@/components/features/dashboard/impersonation-banner';
import { mockUserById } from '@/lib/mock/users';
import { createContextFromCookies } from '@/lib/server/create-context';
import * as adminRepo from '@/lib/server/modules/admin/admin.repository';
import type { UserRole } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login');
  }

  const user = mockUserById(session.userId);
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') ?? '';

  const isPlatformAdmin = session.role === 'super_admin' || session.role === 'staff';
  let navRole: UserRole = session.role;
  let banner: React.ReactNode = null;

  if (isPlatformAdmin) {
    const vendorId = await getAdminVendorIdFromCookies();
    const ownerId = await getAdminOwnerIdFromCookies();
    const ctx = await createContextFromCookies();

    if (pathname.startsWith('/vendor') && vendorId) {
      navRole = 'vendor';
      const vendor = await adminRepo.getVendorById(ctx, vendorId);
      banner = (
        <ImpersonationBanner tenantLabel="Vendor" tenantName={vendor?.name ?? 'Vendor'} />
      );
    } else if (pathname.startsWith('/owner') && ownerId) {
      navRole = 'owner';
      const owner = await adminRepo.getOwnerById(ctx, ownerId);
      banner = (
        <ImpersonationBanner tenantLabel="Owner" tenantName={owner?.name ?? 'Owner'} />
      );
    } else {
      navRole = 'super_admin';
    }
  }

  return (
    <div className="bg-background flex min-h-screen flex-col lg:flex-row">
      <SidebarNav
        role={session.role}
        navRole={navRole}
        userName={user?.fullName ?? 'Signed in'}
        organisation={
          isPlatformAdmin && navRole !== 'super_admin'
            ? `Admin · ${navRole} view`
            : (user?.organisation ?? 'Platform admin')
        }
        logout={logoutAction}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {banner}
          {children}
        </div>
      </main>
    </div>
  );
}
