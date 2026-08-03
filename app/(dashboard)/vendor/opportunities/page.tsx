import { MapPinned, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteMapLoader } from '@/components/features/dashboard/site-map-loader';
import { getVendorScope } from '@/lib/mock/scope';
import { terminalsForVendor } from '@/lib/mock/terminals';
import { mockOpportunities } from '@/lib/mock/opportunities';

const CATEGORY_LABEL: Record<string, string> = {
  mall: 'Shopping mall',
  highway: 'Motorway corridor',
  corporate: 'Corporate campus',
  hospitality: 'Hospitality',
  residential: 'Residential',
};

export default async function VendorOpportunitiesPage() {
  const { vendorId } = await getVendorScope();
  const installed = terminalsForVendor(vendorId);

  const sorted = [...mockOpportunities].sort((a, b) => b.nearestChargerKm - a.nearestChargerKm);
  const avgGap =
    mockOpportunities.reduce((sum, o) => sum + o.nearestChargerKm, 0) / mockOpportunities.length;

  const pins = [
    ...installed.map((t) => ({
      id: t.id,
      latitude: t.latitude,
      longitude: t.longitude,
      label: t.name,
      sublabel: `Installed · ${t.city}`,
      color: '#4e9f3d',
    })),
    ...mockOpportunities.map((o) => ({
      id: o.id,
      latitude: o.latitude,
      longitude: o.longitude,
      label: o.name,
      sublabel: `Opportunity · ${o.nearestChargerKm} km from nearest charger`,
      color: '#e0a11b',
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Opportunities"
        description="Locations with no charger nearby — a pitch list for prospective terminal owners and investors."
        action={
          <Button size="sm" variant="outline">
            Export pitch deck
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Sites installed"
          value={installed.length}
          icon={<MapPinned className="size-4.5" />}
          variant="ink"
        />
        <StatTile
          label="Open opportunities"
          value={mockOpportunities.length}
          hint="Flagged by coverage gap"
        />
        <StatTile
          label="Avg. gap"
          value={`${avgGap.toFixed(0)} km`}
          hint="To nearest existing charger"
          icon={<TrendingUp className="size-4.5" />}
        />
      </div>

      <Card>
        <h2 className="font-heading text-base font-bold">Coverage map</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Green pins are chargers you already operate; amber pins are pitch-ready gaps.
        </p>
        <div className="mt-4">
          <SiteMapLoader pins={pins} height={420} zoom={6} />
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">Pitch list</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {sorted.map((opp) => (
            <Card key={opp.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-base font-bold">{opp.name}</h3>
                    <Badge tone="primary">{CATEGORY_LABEL[opp.category]}</Badge>
                  </div>
                  <p className="text-text-secondary mt-0.5 text-xs">{opp.city}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-occupied text-xl font-bold">
                    {opp.nearestChargerKm} km
                  </p>
                  <p className="text-text-secondary text-[11px]">to nearest charger</p>
                </div>
              </div>
              <p className="text-text-secondary mt-3 text-sm leading-relaxed">{opp.pitch}</p>
              <p className="text-text-secondary mt-2 text-xs font-semibold">
                {opp.estimatedDailyTraffic}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
