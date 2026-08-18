import { Clock, MapPin, Star, Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockVendorProfiles, packagesForVendor } from '@/lib/mock/marketplace';
import { formatMoney } from '@/lib/screenshot-mode';

export default function OwnerVendorsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendors"
        description="Installers registered with Ampere, and the packages they sell — get a new site installed without sourcing a contractor yourself."
      />

      <div className="space-y-6">
        {mockVendorProfiles.map((vendor) => {
          const packages = packagesForVendor(vendor.id);
          return (
            <Card key={vendor.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-bold">{vendor.name}</h2>
                    <span className="text-occupied flex items-center gap-1 text-sm font-semibold">
                      <Star className="size-3.5 fill-current" />
                      {vendor.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-text-secondary mt-1 text-sm">{vendor.tagline}</p>

                  <div className="text-text-secondary mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Zap className="size-3.5" />
                      {vendor.sitesInstalled} sites installed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {vendor.responseTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {vendor.coverageCities.join(', ')}
                    </span>
                  </div>
                </div>
                <Badge tone="neutral">{vendor.yearsActive} yrs on Ampere</Badge>
              </div>

              <div className="border-border mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-image border-border border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-text-primary text-sm font-bold">{pkg.name}</p>
                      {pkg.includesIntegration ? (
                        <Badge tone="success">Ampere integration</Badge>
                      ) : null}
                    </div>
                    <p className="text-text-secondary mt-1.5 text-xs leading-relaxed">
                      {pkg.description}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-text-secondary">Stations</dt>
                        <dd className="text-text-primary font-semibold">{pkg.stationCount}</dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">Total power</dt>
                        <dd className="text-text-primary font-semibold">{pkg.totalKw} kWh</dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">Connector</dt>
                        <dd className="text-text-primary font-semibold">{pkg.connectorType}</dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary">Turnaround</dt>
                        <dd className="text-text-primary font-semibold">
                          {pkg.turnaroundDays} days
                        </dd>
                      </div>
                    </dl>
                    <div className="border-border mt-3.5 flex items-center justify-between gap-2 border-t pt-3.5">
                      <p className="font-heading text-text-primary text-base font-bold">
                        {formatMoney(pkg.priceInPkr)}
                      </p>
                      <Button size="sm">Request</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
