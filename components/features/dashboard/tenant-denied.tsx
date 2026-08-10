import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

export function TenantDenied({ title, message }: { title: string; message: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <Card padded={false}>
        <EmptyState title="Access denied" message={message} />
      </Card>
    </div>
  );
}
