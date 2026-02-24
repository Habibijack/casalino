import Link from 'next/link';
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@casalino/ui';
import { APPLICATION_STATUSES, SCORE_THRESHOLDS } from '@casalino/shared';
import { createApiClient } from '@/lib/api/client';
import { getAccessToken } from '@/lib/api/get-access-token';
import { ApplicantStatusActions } from './status-actions';
import { ReferenceSection } from '@/components/applications/ReferenceSection';

const STATUS_VARIANT_MAP: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'accent'> = {
  new: 'info',
  screening: 'warning',
  invited: 'success',
  rejected: 'destructive',
  confirmed: 'accent',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('de-CH').format(new Date(dateStr));
}

function formatPrice(chf: number | null): string {
  if (chf === null) return '-';
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
  }).format(chf);
}

export default async function ApplicantDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const token = await getAccessToken();

  if (!token) {
    return <div className="py-12 text-center text-muted-foreground">Nicht authentifiziert.</div>;
  }

  const client = createApiClient(token);
  const app = await client.applications.get(id);
  const statusInfo = APPLICATION_STATUSES[app.status as keyof typeof APPLICATION_STATUSES];
  const statusVariant = STATUS_VARIANT_MAP[app.status] ?? 'secondary';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/applicants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-3xl">{app.applicantName}</h1>
            <p className="text-muted-foreground">
              Bewerbung fuer{' '}
              <Link href={`/listings/${app.listingId}`} className="underline">
                {app.listing.address}, {app.listing.city}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant} className="text-sm">
            {statusInfo?.label ?? app.status}
          </Badge>
          <ApplicantStatusActions applicationId={id} currentStatus={app.status} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Uebersicht</TabsTrigger>
          <TabsTrigger value="score">Score</TabsTrigger>
          <TabsTrigger value="documents">
            Dokumente ({app.documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.applicantEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${app.applicantEmail}`} className="underline">
                      {app.applicantEmail}
                    </a>
                  </div>
                )}
                {app.applicantPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${app.applicantPhone}`} className="underline">
                      {app.applicantPhone}
                    </a>
                  </div>
                )}
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Sprache</dt>
                  <dd className="font-medium">{app.applicantLanguage.toUpperCase()}</dd>
                  <dt className="text-muted-foreground">CH-Wohnsitz</dt>
                  <dd className="font-medium">{app.hasSwissResidence ? 'Ja' : 'Nein'}</dd>
                </dl>
              </CardContent>
            </Card>

            {/* Household */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Haushalt & Finanzen</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Haushaltgroesse</dt>
                  <dd className="font-medium">{app.householdSize ?? '-'}</dd>
                  <dt className="text-muted-foreground">Einkommen</dt>
                  <dd className="font-medium">{formatPrice(app.incomeChf)}</dd>
                  <dt className="text-muted-foreground">Beschaeftigung</dt>
                  <dd className="font-medium">{app.employmentType ?? '-'}</dd>
                  <dt className="text-muted-foreground">Haustiere</dt>
                  <dd className="font-medium">
                    {app.hasPets ? (app.petType ?? 'Ja') : 'Nein'}
                  </dd>
                  <dt className="text-muted-foreground">Einzug</dt>
                  <dd className="font-medium">{formatDate(app.desiredMoveDate)}</dd>
                  <dt className="text-muted-foreground">Eingereicht</dt>
                  <dd className="font-medium">{formatDate(app.createdAt)}</dd>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Cover Letter */}
          {app.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bewerbungsschreiben</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{app.coverLetter}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Summary */}
          {app.aiSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KI-Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{app.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Landlord Reference */}
          <ReferenceSection applicationId={id} accessToken={token} />
        </TabsContent>

        <TabsContent value="score" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score-Aufschluesselung</CardTitle>
            </CardHeader>
            <CardContent>
              {app.scoreTotal !== null ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold">{app.scoreTotal}</span>
                    <span className="text-lg text-muted-foreground">/ 100</span>
                  </div>
                  <div className="grid gap-3">
                    <ScoreBar label="Finanzen" score={app.scoreFinancial} max={35} />
                    <ScoreBar label="Dossier" score={app.scoreDossier} max={25} />
                    <ScoreBar label="Matching" score={app.scoreMatching} max={20} />
                    <ScoreBar label="Kommunikation" score={app.scoreCommunication} max={10} />
                    <ScoreBar label="Bonitaet" score={app.scoreCredit} max={10} />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Score wurde noch nicht berechnet. Das Scoring erfolgt automatisch
                  nach Einreichung der Bewerbung.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              {app.documents.length > 0 ? (
                <div className="space-y-2">
                  {app.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <Badge variant={doc.verified ? 'success' : 'secondary'}>
                        {doc.verified ? 'Verifiziert' : 'Hochgeladen'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Noch keine Dokumente hochgeladen.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Score bar component
function ScoreBar({
  label,
  score,
  max,
}: {
  label: string;
  score: number | null;
  max: number;
}) {
  const value = score ?? 0;
  const percentage = (value / max) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="w-32 text-sm text-muted-foreground">{label}</span>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-accent"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="w-16 text-right text-sm font-mono">
        {value}/{max}
      </span>
    </div>
  );
}
