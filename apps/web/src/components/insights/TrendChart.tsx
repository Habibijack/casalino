'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrendDataPoint } from '@/lib/api/client';

interface TrendChartProps {
  data: TrendDataPoint[];
}

function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] ?? month} ${year}`;
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Noch keine Trend-Daten vorhanden.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip
          formatter={(value: number | string | undefined) => [
            value ?? 0,
            'Bewerbungen',
          ]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#E8503E"
          fill="#E8503E"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
