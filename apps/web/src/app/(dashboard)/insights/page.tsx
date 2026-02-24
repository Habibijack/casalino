import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@casalino/ui';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { FunnelChart } from '@/components/insights/FunnelChart';
import { ScoringDistributionChart } from '@/components/insights/ScoringDistributionChart';
import { TrendChart } from '@/components/insights/TrendChart';

export default async function InsightsPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);

  const [funnel, scoring, trend] = await Promise.all([
    client.insights.funnel(),
    client.insights.scoringDistribution(),
    client.insights.trend(),
  ]);

  const totalApplications =
    funnel.new +
    funnel.screening +
    funnel.invited +
    funnel.confirmed +
    funnel.rejected;

  const conversionRate =
    totalApplications > 0
      ? ((funnel.confirmed / totalApplications) * 100).toFixed(1)
      : '0';

  const totalScored =
    scoring.top + scoring.good + scoring.average + scoring.below;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-3xl">Insights</h1>
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* KPI summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bewerbungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">
              Zugesagt / Total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gescored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalScored}</p>
            <p className="text-xs text-muted-foreground">
              Bewerbungen mit Score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bewerbungs-Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoringDistributionChart data={scoring} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Bewerbungs-Trend (letzte 6 Monate)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trend} />
        </CardContent>
      </Card>
    </div>
  );
}
