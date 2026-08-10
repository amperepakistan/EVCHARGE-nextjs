import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export function TenantDenied({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <Card padded={false}>
        <EmptyState title="Access denied" message={message} />
        {actionHref && actionLabel ? (
          <div className="border-border border-t px-6 py-4 text-center">
            <Link
              href={actionHref}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
