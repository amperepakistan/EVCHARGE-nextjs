import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import { logoutAction } from '@/lib/auth/actions';
import { SidebarNav } from '@/components/features/dashboard/sidebar-nav';
import { mockUserById } from '@/lib/mock/users';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login');
  }

  const user = mockUserById(session.userId);

  return (
    <div className="bg-background flex min-h-screen flex-col lg:flex-row">
      <SidebarNav
        role={session.role}
        userName={user?.fullName ?? 'Signed in'}
        organisation={user?.organisation ?? ''}
        logout={logoutAction}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
