import Link from 'next/link';
import { MapPinned, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteMapLoader } from '@/components/features/dashboard/site-map-loader';
import { getOwnerScope } from '@/lib/mock/scope';
import { terminalsForOwner } from '@/lib/mock/terminals';
import { mockOpportunities } from '@/lib/mock/opportunities';

const CATEGORY_LABEL: Record<string, string> = {
  mall: 'Shopping mall',
  highway: 'Motorway corridor',
  corporate: 'Corporate campus',
  hospitality: 'Hospitality',
  residential: 'Residential',
};

export default async function OwnerOpportunitiesPage() {
  const { ownerId } = await getOwnerScope();
  const existing = terminalsForOwner(ownerId);

  // Same coverage-gap dataset the vendor pitches to investors — an owner
  // sees it as "where else could I add a charger", not an investor pitch.
  const sorted = [...mockOpportunities].sort((a, b) => b.nearestChargerKm - a.nearestChargerKm);
  const avgGap =
    mockOpportunities.reduce((sum, o) => sum + o.nearestChargerKm, 0) / mockOpportunities.length;

  const pins = [
    ...existing.map((t) => ({
      id: t.id,
      latitude: t.latitude,
      longitude: t.longitude,
      label: t.name,
      sublabel: `Your site · ${t.city}`,
      color: '#4e9f3d',
    })),
    ...mockOpportunities.map((o) => ({
      id: o.id,
      latitude: o.latitude,
      longitude: o.longitude,
      label: o.name,
      sublabel: `Possible site · ${o.nearestChargerKm} km from nearest charger`,
      color: '#e0a11b',
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Expansion opportunities"
        description="Locations with no charger nearby — worth considering if you're weighing another site."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Your sites"
          value={existing.length}
          icon={<MapPinned className="size-4.5" />}
          variant="ink"
        />
        <StatTile
          label="Possible sites"
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
          Green pins are your current sites; amber pins are underserved locations.
        </p>
        <div className="mt-4">
          <SiteMapLoader pins={pins} height={420} zoom={6} />
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold tracking-tight">Possible locations</h2>
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
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-text-secondary text-xs font-semibold">
                  {opp.estimatedDailyTraffic}
                </p>
                <Link href="/owner/vendors">
                  <Button variant="outline" size="sm">
                    Browse vendors
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
