import Link from 'next/link';
import { BarChart3, Clock, TrendingUp, Trophy } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@casalino/ui';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { FunnelChart } from '@/components/insights/FunnelChart';
import { ScoringDistributionChart } from '@/components/insights/ScoringDistributionChart';
import { TrendChart } from '@/components/insights/TrendChart';

const STATUS_VARIANT_MAP: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'accent'> = {
  draft: 'secondary' as 'info',
  live: 'success',
  paused: 'warning',
  closed: 'destructive',
};

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
  }).format(chf);
}

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

  const [funnel, scoring, trend, timeToFill, listingsPerf] = await Promise.all([
    client.insights.funnel(),
    client.insights.scoringDistribution(),
    client.insights.trend(),
    client.insights.timeToFill(),
    client.insights.listingsPerformance(),
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bewerbungen
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">
              Zugesagt / Total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time-to-Fill
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {timeToFill.completedContracts > 0
                ? `${timeToFill.avgDays} Tage`
                : '-'}
            </p>
            {timeToFill.completedContracts > 0 && (
              <p className="text-xs text-muted-foreground">
                Min {timeToFill.minDays} / Max {timeToFill.maxDays} Tage
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gescored
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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

      {/* Per-listing performance table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inserat-Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {listingsPerf.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inserat</TableHead>
                  <TableHead className="text-right">Preis</TableHead>
                  <TableHead className="text-right">Bewerbungen</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Top-Kandidaten</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listingsPerf.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {listing.address}, {listing.city}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(listing.priceChf)}
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.applicationCount}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {listing.applicationCount > 0
                        ? listing.avgScore.toFixed(1)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.topCandidates}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT_MAP[listing.status] ?? 'info'}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Noch keine Inserate vorhanden.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
