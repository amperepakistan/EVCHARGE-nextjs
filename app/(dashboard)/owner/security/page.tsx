import {
  Camera,
  CameraOff,
  CarFront,
  DoorOpen,
  KeyRound,
  ScanLine,
  TriangleAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatTile } from '@/components/ui/stat-tile';
import { getOwnerScope } from '@/lib/mock/scope';
import { terminalsForOwner } from '@/lib/mock/terminals';
import { mockAnpr, mockCameras, mockParkingBays } from '@/lib/mock/operations';

const ACCESS_METHODS = [
  { icon: KeyRound, label: 'RFID cards', detail: '42 issued · 3 revoked' },
  { icon: ScanLine, label: 'QR access', detail: 'Enabled for visitors' },
  { icon: DoorOpen, label: 'Barrier gate', detail: 'Auto-open on whitelist' },
];

export default async function OwnerSecurityPage() {
  const { ownerId } = await getOwnerScope();
  const ids = terminalsForOwner(ownerId).map((t) => t.id);

  const cameras = mockCameras.filter((c) => ids.includes(c.terminalId));
  const captures = mockAnpr.filter((a) => ids.includes(a.terminalId));
  const iceBays = mockParkingBays.filter((b) => b.occupiedBy === 'ice');
  const overstays = mockParkingBays.filter((b) => b.overstayMinutes > 30);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Site security"
        description="Cameras, plate recognition, parking enforcement and access control for your premises."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Cameras online"
          value={`${cameras.filter((c) => c.online).length}/${cameras.length}`}
          icon={<Camera className="size-4.5" />}
          variant="ink"
        />
        <StatTile
          label="ICE blocking"
          value={iceBays.length}
          hint="Non-EV in a charging bay"
          tone={iceBays.length > 0 ? 'danger' : 'default'}
          icon={<CarFront className="size-4.5" />}
        />
        <StatTile
          label="Overstays"
          value={overstays.length}
          hint="Over 30 minutes idle"
          tone={overstays.length > 0 ? 'warning' : 'default'}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">CCTV</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cameras.map((camera) => (
              <Card key={camera.id} padded={false}>
                <div className="bg-ink text-on-ink/40 flex h-28 items-center justify-center">
                  {camera.online ? (
                    <Camera className="size-7" />
                  ) : (
                    <CameraOff className="size-7" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="truncate text-xs font-semibold">{camera.label}</p>
                  <Badge tone={camera.online ? 'success' : 'danger'}>
                    {camera.online ? 'Live' : 'Offline'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Parking bays</h2>
          <Card padded={false}>
            <ul className="divide-border divide-y">
              {mockParkingBays.map((bay) => (
                <li key={bay.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-text-primary text-sm font-semibold">{bay.label}</p>
                    <p className="text-text-secondary text-xs">
                      {bay.occupiedBy === null
                        ? 'Free'
                        : bay.occupiedBy === 'ev'
                          ? 'EV charging'
                          : 'Non-EV vehicle'}
                    </p>
                  </div>
                  {bay.occupiedBy === 'ice' ? (
                    <Badge tone="danger" icon={<TriangleAlert className="size-3" />}>
                      ICE blocking
                    </Badge>
                  ) : bay.overstayMinutes > 30 ? (
                    <Badge tone="warning">{bay.overstayMinutes}m overstay</Badge>
                  ) : (
                    <Badge tone="neutral">OK</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold tracking-tight">
              Plate recognition
            </h2>
            <Button variant="outline" size="sm">
              Manage lists
            </Button>
          </div>
          <Card padded={false}>
            <ul className="divide-border divide-y">
              {captures.map((capture) => (
                <li key={capture.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-mono text-sm font-bold tracking-wider">
                      {capture.plate}
                    </p>
                    <p className="text-text-secondary text-xs">{capture.capturedAt}</p>
                  </div>
                  <Badge
                    tone={
                      capture.listStatus === 'whitelist'
                        ? 'success'
                        : capture.listStatus === 'blacklist'
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {capture.listStatus}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Access control</h2>
          <div className="grid gap-3">
            {ACCESS_METHODS.map(({ icon: Icon, label, detail }) => (
              <Card key={label}>
                <div className="flex items-center gap-3">
                  <span className="bg-surface-muted text-primary-800 rounded-image flex size-10 shrink-0 items-center justify-center">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary text-sm font-semibold">{label}</p>
                    <p className="text-text-secondary text-xs">{detail}</p>
                  </div>
                  <Badge tone="success">Active</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
