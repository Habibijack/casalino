import Link from 'next/link';
import { Building2, Users, Calendar, FileText } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@casalino/ui';
import { APPLICATION_STATUSES, SCORE_THRESHOLDS } from '@casalino/shared';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

function getScoreBadge(score: number | null) {
  if (score === null) return null;
  if (score >= SCORE_THRESHOLDS.top.min) {
    return { label: SCORE_THRESHOLDS.top.label, variant: 'success' as const };
  }
  if (score >= SCORE_THRESHOLDS.good.min) {
    return { label: SCORE_THRESHOLDS.good.label, variant: 'info' as const };
  }
  if (score >= SCORE_THRESHOLDS.average.min) {
    return { label: SCORE_THRESHOLDS.average.label, variant: 'warning' as const };
  }
  return { label: SCORE_THRESHOLDS.below.label, variant: 'destructive' as const };
}

const STATUS_VARIANT_MAP: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'accent'> = {
  new: 'info',
  screening: 'warning',
  invited: 'success',
  rejected: 'destructive',
  confirmed: 'accent',
};

export default async function DashboardPage() {
  const token = await getAccessToken();

  if (!token) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nicht authentifiziert.
      </div>
    );
  }

  const client = createApiClient(token);

  const [stats, recentApps] = await Promise.all([
    client.dashboard.stats(),
    client.dashboard.recentApplications(),
  ]);

  const statCards = [
    { label: 'Aktive Inserate', value: stats.activeListings, icon: Building2, href: '/listings' },
    { label: 'Offene Bewerbungen', value: stats.openApplications, icon: Users, href: '/applicants' },
    { label: 'Anstehende Besichtigungen', value: stats.upcomingViewings, icon: Calendar, href: '/viewings' },
    { label: 'Laufende Vertraege', value: stats.pendingContracts, icon: FileText, href: '/contracts' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-xl">Neueste Bewerbungen</h2>
        {recentApps.length > 0 ? (
          <div className="space-y-2">
            {recentApps.map((app) => {
              const statusInfo = APPLICATION_STATUSES[app.status as keyof typeof APPLICATION_STATUSES];
              const statusVariant = STATUS_VARIANT_MAP[app.status] ?? 'info';
              const scoreBadge = getScoreBadge(app.scoreTotal);

              return (
                <Link key={app.id} href={`/applicants/${app.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{app.applicantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.listingAddress}, {app.listingCity} &middot; {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {scoreBadge && (
                          <Badge variant={scoreBadge.variant}>
                            {app.scoreTotal} – {scoreBadge.label}
                          </Badge>
                        )}
                        <Badge variant={statusVariant}>
                          {statusInfo?.label ?? app.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine Bewerbungen vorhanden.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
