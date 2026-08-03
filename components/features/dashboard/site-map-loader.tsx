'use client';

import dynamic from 'next/dynamic';
import type { MapPin } from '@/components/features/dashboard/site-map';

// Leaflet touches `window` at import time, which breaks SSR. Dynamically
// importing with ssr:false keeps this out of the server render entirely, so
// pages that use it stay Server Components apart from this one leaf.
const SiteMap = dynamic(
  () => import('@/components/features/dashboard/site-map').then((m) => m.SiteMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-muted rounded-image flex h-90 items-center justify-center">
        <span className="text-text-secondary text-sm">Loading map…</span>
      </div>
    ),
  },
);

export function SiteMapLoader(props: {
  pins: MapPin[];
  height?: number;
  center?: [number, number];
  zoom?: number;
}) {
  return <SiteMap {...props} />;
}
