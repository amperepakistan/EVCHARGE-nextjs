import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StatusDot, STATUS_LABELS } from '@/components/ui/status-dot';
import { ChargerReviewActions } from '@/components/features/admin/charger-review-actions';
import { requireAdminDashboard } from '@/lib/server/dashboard';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';
import type { TerminalStatus } from '@/types/database.types';

type ChargerRow = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  connector_type: string | null;
  status: TerminalStatus | 'unknown';
  connectivity_tier: string;
  power_kw: number | null;
  vendorName: string | null;
  ownerName: string | null;
  lastSeen: string | null;
  is_public: boolean;
  source: string | null;
  verification_status: 'unverified' | 'verified' | 'flagged';
  submission_notes: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  isDriverScout?: boolean;
  created_at: string;
};

const columns: Column<ChargerRow>[] = [
  {
    key: 'name',
    header: 'Charger',
    render: (t) => (
      <div className="min-w-0">
        <p className="text-text-primary truncate font-semibold">{t.name}</p>
        <p className="text-text-secondary truncate text-xs">{t.city ?? '—'}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <StatusDot status={t.status} />
        <span className="text-text-secondary text-xs font-semibold">
          {STATUS_LABELS[t.status]}
        </span>
      </span>
    ),
  },
  {
    key: 'visibility',
    header: 'Visibility',
    render: (t) =>
      t.is_public ? (
        <Badge tone="success">Public</Badge>
      ) : (
        <Badge tone="warning">Hidden</Badge>
      ),
  },
  {
    key: 'source',
    header: 'Source',
    render: (t) => <Badge tone="neutral">{t.source ?? '—'}</Badge>,
  },
  {
    key: 'vendor',
    header: 'Vendor',
    render: (t) => (
      <span className="text-text-secondary text-xs">{t.vendorName ?? 'Unassigned'}</span>
    ),
  },
  {
    key: 'owner',
    header: 'Owner',
    render: (t) => (
      <span className="text-text-secondary text-xs">{t.ownerName ?? 'Unassigned'}</span>
    ),
  },
  {
    key: 'tier',
    header: 'Telemetry',
    render: (t) =>
      terminalsService.isConnectedTier(t.connectivity_tier) ? (
        <Badge tone="success">Connected</Badge>
      ) : t.connectivity_tier === 'sensor_augmented' ? (
        <Badge tone="primary">Sensor</Badge>
      ) : (
        <Badge tone="neutral">Listed</Badge>
      ),
  },
  {
    key: 'power',
    header: 'Power',
    align: 'right',
    render: (t) => (
      <span className="tabular-nums">
        {t.power_kw != null ? `${t.power_kw} kW` : '—'}
      </span>
    ),
  },
];

function sourceLabel(source: string | null, isDriverScout?: boolean) {
  if (isDriverScout || source === 'driver_submitted') return 'Driver scout';
  if (!source) return 'Unknown source';
  return source.replaceAll('_', ' ');
}

export default async function AdminChargersPage() {
  const { ctx } = await requireAdminDashboard();
  const chargers = await adminService.listNetworkChargers(ctx);
  const pending = chargers.filter(
    (t) => !t.is_public && t.verification_status !== 'flagged',
  );
  const live = chargers.filter((t) => t.is_public);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network chargers"
        description={`${live.length} public terminals · ${pending.length} waiting for review.`}
      />

      <section id="pending" className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-bold">Pending review</h2>
          <p className="text-text-secondary text-sm">
            When a driver taps “Help us map Oman”, the station lands here — hidden from
            the public app until you approve it.
          </p>
        </div>
        {pending.length === 0 ? (
          <Card>
            <p className="text-text-primary text-sm font-semibold">No scouts waiting</p>
            <p className="text-text-secondary mt-1 text-sm">
              New driver submissions show up here automatically.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <Card key={t.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-base font-bold">{t.name}</p>
                      <Badge tone="warning">{sourceLabel(t.source, t.isDriverScout)}</Badge>
                      <Badge tone="neutral">{t.verification_status}</Badge>
                    </div>
                    <p className="text-text-secondary text-sm">
                      {[t.address, t.city].filter(Boolean).join(' · ') || 'No address'}
                    </p>
                    <p className="text-text-secondary text-xs tabular-nums">
                      {Number(t.latitude).toFixed(5)}, {Number(t.longitude).toFixed(5)}
                      {t.connector_type ? ` · ${t.connector_type}` : ''}
                    </p>
                    {t.submission_notes ? (
                      <p className="text-text-primary text-sm">{t.submission_notes}</p>
                    ) : null}
                    <p className="text-text-secondary text-xs">
                      Submitted by {t.submitterName || t.submitterEmail || 'unknown driver'}
                      {' · '}
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${t.latitude},${t.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-800 hover:underline text-xs font-semibold"
                    >
                      Open pin on Google Maps
                    </a>
                  </div>
                  <ChargerReviewActions terminalId={t.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <DataTable
        columns={columns}
        rows={live}
        getRowKey={(t) => t.id}
        emptyTitle="No public chargers"
        emptyMessage="Terminals will appear here once seeded, registered, or approved."
      />
    </div>
  );
}
