'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { FunnelData } from '@/lib/api/client';

const STAGE_COLORS: Record<string, string> = {
  Neu: '#3b82f6',
  'In Pruefung': '#f59e0b',
  Eingeladen: '#22c55e',
  Zugesagt: '#E8503E',
  Abgesagt: '#ef4444',
};

interface FunnelChartProps {
  data: FunnelData;
}

export function FunnelChart({ data }: FunnelChartProps) {
  const chartData = [
    { stage: 'Neu', count: data.new },
    { stage: 'In Pruefung', count: data.screening },
    { stage: 'Eingeladen', count: data.invited },
    { stage: 'Zugesagt', count: data.confirmed },
    { stage: 'Abgesagt', count: data.rejected },
  ];

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Noch keine Bewerbungsdaten vorhanden.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="stage" width={100} />
        <Tooltip
          formatter={(value: number | string | undefined) => [
            value ?? 0,
            'Bewerbungen',
          ]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.stage}
              fill={STAGE_COLORS[entry.stage] ?? '#94a3b8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
