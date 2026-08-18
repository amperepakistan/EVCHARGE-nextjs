import { Clock, MapPin, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StationCoverImage } from '@/components/features/dashboard/station-cover-image';
import { requireOwnerDashboard, TenantAccessError } from '@/lib/server/dashboard';
import { amenitiesList, photoUrl } from '@/lib/server/dashboard-ui';
import { TenantDenied } from '@/components/features/dashboard/tenant-denied';
import { demoSiteAmenities, demoSitePhoto } from '@/lib/server/owner-demo-data';
import * as terminalsService from '@/lib/server/modules/terminals/terminals.service';

export default async function OwnerSitesPage() {
  try {
    const { ctx, scope } = await requireOwnerDashboard();
    const terminals = await terminalsService.listTerminalsForOwner(ctx, scope.ownerId);

    return (
      <div className="space-y-6">
        <PageHeader
          title="My sites"
          description="The public listing drivers see in the Ampere app. You maintain this because it is your property."
        />

        {terminals.length === 0 ? (
          <Card padded={false}>
            <EmptyState
              title="No sites yet"
              message="When terminals are assigned to your account, they will appear here."
            />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {terminals.map((terminal) => {
              const photo = photoUrl(terminal.google_photo_urls) ?? demoSitePhoto(terminal.id);
              const listed = amenitiesList(terminal.amenities).filter(
                (a) => !a.startsWith('__') && !a.startsWith('user:') && !a.startsWith('notes:'),
              );
              const amenities = listed.length > 0 ? listed : demoSiteAmenities(terminal.id);
              return (
                <Card key={terminal.id} padded={false}>
                  <div className="relative h-40 w-full overflow-hidden bg-surface-muted">
                    <StationCoverImage
                      src={photo}
                      fallbackSrc={demoSitePhoto(terminal.id)}
                      alt={terminal.name}
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-heading truncate text-base font-bold">
                          {terminal.name}
                        </h2>
                        <p className="text-text-secondary mt-1 flex items-center gap-1.5 text-xs">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {[terminal.address, terminal.city].filter(Boolean).join(', ')}
                          </span>
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    </div>

                    <p className="text-text-secondary mt-3 flex items-center gap-1.5 text-xs">
                      <Clock className="size-3.5" />
                      {terminal.operating_hours ?? 'Hours not set'}
                    </p>

                    <div className="mt-4">
                      <p className="text-text-secondary text-xs font-bold tracking-wide uppercase">
                        Amenities
                      </p>
                      {amenities.length === 0 ? (
                        <p className="text-text-secondary mt-2 text-xs">None listed</p>
                      ) : (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {amenities.map((amenity) => (
                            <li key={amenity}>
                              <Badge tone="neutral">{amenity}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <dl className="border-border mt-4 grid grid-cols-3 gap-3 border-t pt-4 text-xs">
                      <div>
                        <dt className="text-text-secondary">Connector</dt>
                        <dd className="text-text-primary mt-0.5 font-semibold">
                          {terminal.connector_type ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">Power</dt>
                        <dd className="text-text-primary mt-0.5 font-semibold">
                          {terminal.power_kw != null ? `${terminal.power_kw} kW` : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">Coordinates</dt>
                        <dd className="text-text-primary mt-0.5 font-semibold tabular-nums">
                          {terminal.latitude.toFixed(3)}, {terminal.longitude.toFixed(3)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      return (
        <TenantDenied
          title="My sites"
          message={err.message}
        />
      );
    }
    throw err;
  }
}
