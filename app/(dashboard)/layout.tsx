import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import { DashboardNav } from '@/components/features/dashboard/dashboard-nav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <DashboardNav role={session.role} />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
