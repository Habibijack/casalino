'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Label,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@casalino/ui';
import type { ReferenceCheckRow } from '@/lib/api/client';
import {
  requestReferenceAction,
  sendReferenceReminderAction,
} from '@/app/(dashboard)/applicants/actions';

interface ReferenceSectionProps {
  applicationId: string;
  accessToken: string;
}

function formatDaysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Heute';
  if (days === 1) return 'Vor 1 Tag';
  return `Vor ${days} Tagen`;
}

function StarRatingDisplay({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < value
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-48 text-sm text-muted-foreground">{label}</span>
      <StarRatingDisplay value={value} max={5} />
      <span className="text-sm font-mono">{value}/5</span>
    </div>
  );
}

function RequestReferenceDialog({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [landlordName, setLandlordName] = useState('');
  const [landlordEmail, setLandlordEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit() {
    if (!landlordName.trim() || !landlordEmail.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await requestReferenceAction({
        applicationId,
        landlordName: landlordName.trim(),
        landlordEmail: landlordEmail.trim(),
      });

      if (result.success) {
        setOpen(false);
        setLandlordName('');
        setLandlordEmail('');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="mr-2 h-4 w-4" />
          Referenz anfragen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vermieter-Referenz anfragen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="landlordName">
              Name des bisherigen Vermieters
            </Label>
            <Input
              id="landlordName"
              value={landlordName}
              onChange={(e) => setLandlordName(e.target.value)}
              placeholder="Max Muster"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="landlordEmail">
              E-Mail des bisherigen Vermieters
            </Label>
            <Input
              id="landlordEmail"
              type="email"
              value={landlordEmail}
              onChange={(e) => setLandlordEmail(e.target.value)}
              placeholder="vermieter@beispiel.ch"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={
              isPending ||
              !landlordName.trim() ||
              !landlordEmail.trim()
            }
            className="w-full"
          >
            {isPending ? 'Wird gesendet...' : 'Anfrage senden'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReferenceSection({
  applicationId,
  accessToken,
}: ReferenceSectionProps) {
  const router = useRouter();
  const [reference, setReference] = useState<ReferenceCheckRow | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  const fetchReference = useCallback(() => {
    setLoading(true);
    fetch(
      `${API_BASE}/api/v1/applications/${applicationId}/reference`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setReference(json.data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [applicationId, accessToken, API_BASE]);

  useEffect(() => {
    fetchReference();
  }, [fetchReference]);

  function handleRemind(referenceCheckId: string) {
    startTransition(async () => {
      const result =
        await sendReferenceReminderAction(referenceCheckId);
      if (result.success) {
        fetchReference();
        router.refresh();
      }
    });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vermieter-Referenz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Wird geladen...
          </p>
        </CardContent>
      </Card>
    );
  }

  // No reference check exists yet
  if (notFound || !reference) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vermieter-Referenz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Noch keine Referenzpruefung vorhanden.
            </p>
            <RequestReferenceDialog applicationId={applicationId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending / Sent
  if (reference.status === 'pending' || reference.status === 'sent') {
    const sentDate = reference.sentAt ?? reference.createdAt;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vermieter-Referenz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Ausstehend</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDaysAgo(sentDate)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gesendet an {reference.landlordName} (
                  {reference.landlordEmail})
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemind(reference.id)}
              disabled={isPending}
            >
              {isPending ? 'Wird gesendet...' : 'Erinnern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed
  if (reference.status === 'completed' && reference.responses) {
    const r = reference.responses;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Vermieter-Referenz
            </CardTitle>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <Badge variant="success">Abgeschlossen</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <RatingBar
              label="Puenktlichkeit Mietzahlung"
              value={r.paymentPunctuality}
            />
            <RatingBar
              label="Zustand der Wohnung"
              value={r.propertyCondition}
            />
            <RatingBar
              label="Verhalten ggue. Nachbarn"
              value={r.neighborBehavior}
            />
            <RatingBar
              label="Einhaltung Hausordnung"
              value={r.houseRulesCompliance}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Erneut vermieten?
            </span>
            <Badge variant={r.wouldRentAgain ? 'success' : 'destructive'}>
              {r.wouldRentAgain ? 'Ja' : 'Nein'}
            </Badge>
          </div>

          {r.comment && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-sm font-medium">Kommentar</p>
                <p className="text-sm text-muted-foreground">
                  {r.comment}
                </p>
              </div>
            </>
          )}

          {reference.scoreImpact !== null && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Score-Einfluss:
                </span>
                <Badge
                  variant={
                    reference.scoreImpact >= 0 ? 'success' : 'destructive'
                  }
                >
                  {reference.scoreImpact >= 0 ? '+' : ''}
                  {reference.scoreImpact} Punkte
                </Badge>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Referenz von {reference.landlordName} (
            {reference.landlordEmail})
          </p>
        </CardContent>
      </Card>
    );
  }

  // Expired
  if (reference.status === 'expired') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vermieter-Referenz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div>
                <Badge variant="destructive">Abgelaufen</Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  Referenzanfrage an {reference.landlordName} ist
                  abgelaufen.
                </p>
              </div>
            </div>
            <RequestReferenceDialog applicationId={applicationId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback for unknown status
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vermieter-Referenz</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Status: {reference.status}
        </p>
      </CardContent>
    </Card>
  );
}
