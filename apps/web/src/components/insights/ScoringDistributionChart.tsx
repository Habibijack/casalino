'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ScoringDistributionData } from '@/lib/api/client';

const BUCKET_CONFIG = [
  { key: 'top', label: 'Top (80+)', color: '#22c55e' },
  { key: 'good', label: 'Gut (60-79)', color: '#3b82f6' },
  { key: 'average', label: 'Durchschnitt (40-59)', color: '#f59e0b' },
  { key: 'below', label: 'Unter Schwelle (<40)', color: '#ef4444' },
] as const;

interface ScoringDistributionChartProps {
  data: ScoringDistributionData;
}

export function ScoringDistributionChart({
  data,
}: ScoringDistributionChartProps) {
  const chartData = BUCKET_CONFIG.map((bucket) => ({
    name: bucket.label,
    value: data[bucket.key],
    color: bucket.color,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Noch keine Scoring-Daten vorhanden.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | undefined) => [
            value ?? 0,
            'Bewerbungen',
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
