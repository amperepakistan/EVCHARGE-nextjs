import { Clock, Layers, Pencil, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOwnerScope } from '@/lib/mock/scope';
import { terminalById, terminalsForOwner } from '@/lib/mock/terminals';
import { mockTariffs } from '@/lib/mock/operations';
import type { PricingModel } from '@/lib/mock/types';

const MODEL_META: Record<
  PricingModel,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  flat: { icon: Wallet, label: 'Flat rate' },
  time: { icon: Clock, label: 'Time based' },
  hybrid: { icon: Layers, label: 'Hybrid' },
  dynamic: { icon: TrendingUp, label: 'Dynamic' },
};

export default async function OwnerPricingPage() {
  const { ownerId } = await getOwnerScope();
  const terminals = terminalsForOwner(ownerId);
  const ids = terminals.map((t) => t.id);

  const tariffs = mockTariffs
    .map((tariff) => ({
      ...tariff,
      appliedToTerminalIds: tariff.appliedToTerminalIds.filter((id) => ids.includes(id)),
    }))
    .filter((tariff) => tariff.appliedToTerminalIds.length > 0);

  const unpriced = ids.filter(
    (id) => !mockTariffs.some((t) => t.appliedToTerminalIds.includes(id)),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pricing"
        description="You set the day-to-day rate at your site — your vendor handles installation and maintenance only."
        action={<Button size="sm">New tariff</Button>}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {tariffs.map((tariff) => {
          const { icon: Icon, label } = MODEL_META[tariff.model];
          return (
            <Card key={tariff.id}>
              <div className="flex items-start gap-3">
                <span className="bg-surface-muted text-primary-800 rounded-image flex size-10 shrink-0 items-center justify-center">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-base font-bold">{tariff.name}</h2>
                    <Badge tone="primary">{label}</Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-sm">{tariff.summary}</p>

                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {tariff.appliedToTerminalIds.map((id) => (
                      <li
                        key={id}
                        className="rounded-tag bg-surface-muted text-text-secondary px-2 py-1 text-xs font-semibold"
                      >
                        {terminalById(id)?.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm">
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {unpriced.length > 0 ? (
        <Card variant="muted">
          <h2 className="font-heading text-base font-bold">Not on a tariff</h2>
          <p className="text-text-secondary mt-1 text-sm">
            These chargers are billing at their default rate — assign a tariff to set your own
            price.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {unpriced.map((id) => (
              <li
                key={id}
                className="rounded-tag bg-surface text-text-primary border-border border px-2.5 py-1 text-xs font-semibold"
              >
                {terminalById(id)?.name}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
