import { mockHourlyUsage, mockRevenueSeries } from '@/lib/mock/operations';
import { OWNER_REVENUE_SHARE } from '@/lib/server/modules/revenue/revenue.service';

const SITE_PHOTOS = [
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1617886322207-6f504e7472c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?auto=format&fit=crop&w=1200&q=80',
];

const SITE_AMENITIES = [
  ['Parking', 'CCTV', 'Restroom'],
  ['Mall access', 'Cafe', 'Covered parking'],
  ['Waiting area', 'CCTV', '24/7 access'],
  ['Security', 'Parking', 'Wifi'],
];

function hashKey(value: string) {
  return [...value].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function demoSitePhoto(id: string) {
  return SITE_PHOTOS[hashKey(id) % SITE_PHOTOS.length]!;
}

export function demoSiteAmenities(id: string) {
  return SITE_AMENITIES[hashKey(id) % SITE_AMENITIES.length]!;
}

export function demoHourlyUsage() {
  return mockHourlyUsage.map((row) => ({
    hour: Number.parseInt(row.hour, 10),
    sessions: row.sessions,
  }));
}

export function demoEnergySeries() {
  return mockRevenueSeries.map((p) => ({
    date: p.date,
    energyKwh: p.energyKwh,
  }));
}

export function demoRevenueDashboard<T extends { id: string; name: string; city: string | null }>(
  terminals: T[],
) {
  const series = mockRevenueSeries.map((p) => ({
    date: p.date,
    share: Math.round(p.revenue * OWNER_REVENUE_SHARE),
    energyKwh: p.energyKwh,
    revenue: p.revenue,
  }));
  const grossTotal = series.reduce((sum, p) => sum + p.revenue, 0);
  const shareTotal = Math.round(grossTotal * OWNER_REVENUE_SHARE);

  const weights = terminals.map((_, i) => (terminals.length - i) * 3 + 4);
  const weightSum = weights.reduce((sum, w) => sum + w, 0) || 1;
  const rows = terminals.map((terminal, i) => {
    const weight = weights[i] ?? 1;
    const gross = grossTotal * (weight / weightSum);
    const sessions = 18 + (hashKey(terminal.id) % 40);
    return {
      terminal,
      sessions,
      gross,
      share: Math.round(gross * OWNER_REVENUE_SHARE),
    };
  });

  return { series, rows, grossTotal, shareTotal };
}

export function demoAnalyticsStats(terminalNames: string[]) {
  const hourly = demoHourlyUsage();
  const peak = hourly.reduce((a, b) => (b.sessions > a.sessions ? b : a), {
    hour: 0,
    sessions: 0,
  });
  const busiestName = terminalNames[0] ?? 'Destination charger';
  return {
    peak,
    avgKwh: 32.4,
    busiest: { name: busiestName, count: 47 },
    hourly,
    energySeries: demoEnergySeries(),
  };
}
