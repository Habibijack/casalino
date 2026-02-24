'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, CalendarCheck, MapPin, User } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@casalino/ui';

interface PublicViewingData {
  id: string;
  status: string;
  slotStart: string;
  slotEnd: string;
  listingAddress: string;
  listingCity: string;
  listingPlz: string;
  applicantName: string;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function BookViewingPage() {
  const params = useParams();
  const viewingId = params?.viewingId;

  const [viewing, setViewing] = useState<PublicViewingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  useEffect(() => {
    if (!viewingId || typeof viewingId !== 'string') return;

    fetch(`${API_BASE}/api/v1/public/viewings/${viewingId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setViewing(json.data);
          if (json.data.status === 'confirmed') {
            setAlreadyConfirmed(true);
          }
        } else {
          setError(json.error?.message ?? 'Besichtigung nicht gefunden');
        }
      })
      .catch(() => setError('Verbindungsfehler'))
      .finally(() => setLoading(false));
  }, [viewingId, API_BASE]);

  async function handleConfirm() {
    if (!viewingId || typeof viewingId !== 'string') return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/public/viewings/${viewingId}/confirm`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      );
      const json = await res.json();
      if (json.success) {
        if (json.data.alreadyConfirmed) {
          setAlreadyConfirmed(true);
        } else {
          setConfirmed(true);
        }
      } else {
        setError(json.error?.message ?? 'Fehler beim Bestaetigen');
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Besichtigung wird geladen...</p>
      </div>
    );
  }

  if (error && !viewing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!viewing) return null;

  const { date, time } = formatDateTime(viewing.slotStart);
  const fullAddress = `${viewing.listingAddress}, ${viewing.listingPlz} ${viewing.listingCity}`;

  if (confirmed || alreadyConfirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="border-success">
          <CardContent className="py-12 text-center">
            <Check className="mx-auto mb-4 h-12 w-12 text-success" />
            <h2 className="mb-2 text-2xl font-bold text-success">
              {alreadyConfirmed && !confirmed
                ? 'Bereits bestaetigt'
                : 'Besichtigung bestaetigt!'}
            </h2>
            <p className="text-muted-foreground">
              {alreadyConfirmed && !confirmed
                ? `Ihre Besichtigung fuer ${fullAddress} wurde bereits bestaetigt.`
                : 'Ihre Besichtigung wurde bestaetigt.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl">Besichtigung bestaetigen</h1>
          <p className="mt-2 text-muted-foreground">{fullAddress}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Termindetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Bewerber</p>
                <p className="font-medium">{viewing.applicantName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Objekt</p>
                <p className="font-medium">{fullAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Datum und Uhrzeit</p>
                <p className="font-medium">{date}</p>
                <p className="text-sm text-muted-foreground">{time} Uhr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <Button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full"
          size="lg"
        >
          {confirming ? 'Wird bestaetigt...' : 'Besichtigung bestaetigen'}
        </Button>
      </div>
    </div>
  );
}
