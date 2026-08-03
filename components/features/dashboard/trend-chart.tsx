'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AXIS = { fontSize: 11, fill: 'var(--color-text-secondary)' } as const;

interface TrendChartProps {
  /** Any row shape works — the chart only reads `xKey` and `yKey`. */
  data: readonly object[];
  xKey: string;
  yKey: string;
  kind?: 'area' | 'bar';
  /** Prefix shown in the tooltip, e.g. "Rs ". */
  valuePrefix?: string;
  valueSuffix?: string;
  height?: number;
}

export function TrendChart({
  data,
  xKey,
  yKey,
  kind = 'area',
  valuePrefix = '',
  valueSuffix = '',
  height = 260,
}: TrendChartProps) {
  const tooltip = (
    <Tooltip
      cursor={{ fill: 'var(--color-surface-muted)' }}
      contentStyle={{
        borderRadius: 'var(--radius-button)',
        border: '1px solid var(--color-border)',
        fontSize: 12,
        boxShadow: 'none',
      }}
      formatter={(value) => [
        `${valuePrefix}${Number(value ?? 0).toLocaleString()}${valueSuffix}`,
        '',
      ]}
    />
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {kind === 'area' ? (
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={56} />
          {tooltip}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="var(--color-primary-600)"
            strokeWidth={2}
            fill="url(#trendFill)"
          />
        </AreaChart>
      ) : (
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} />
          {tooltip}
          <Bar dataKey={yKey} fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
