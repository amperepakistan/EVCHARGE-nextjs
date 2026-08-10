import { exitTenantDashboardAction } from '@/lib/auth/admin-actions';
import { Button } from '@/components/ui/button';

export function ImpersonationBanner({
  tenantLabel,
  tenantName,
}: {
  tenantLabel: 'Vendor' | 'Owner';
  tenantName: string;
}) {
  return (
    <div className="border-border bg-surface-muted mb-6 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-text-primary text-sm font-semibold">
          Viewing as {tenantLabel}: {tenantName}
        </p>
        <p className="text-text-secondary text-xs">
          You have full control of this tenant dashboard. Exit to return to Admin.
        </p>
      </div>
      <form action={exitTenantDashboardAction}>
        <Button type="submit" variant="outline" size="sm">
          Exit to Admin
        </Button>
      </form>
    </div>
  );
}
