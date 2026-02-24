'use client';

import { useState } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@casalino/ui';

interface FeatureCard {
  key: string;
  label: string;
  amount: number;
  unit: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    key: 'scoring',
    label: 'AI Scoring',
    amount: 199,
    unit: '/ Monat',
    description: 'Automatisches Scoring aller eingehenden Bewerbungen mit KI-Zusammenfassung.',
  },
  {
    key: 'creditCheck',
    label: 'Bonitaetspruefung',
    amount: 9,
    unit: '/ Pruefung',
    description: 'Automatische Bonitaetspruefung via Tilbago fuer jeden Bewerber.',
  },
  {
    key: 'contract',
    label: 'Vertragserstellung',
    amount: 49,
    unit: '/ Vertrag',
    description: 'Digitale Mietvertraege mit elektronischer Unterschrift.',
  },
];

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
  }).format(chf);
}

export default function BillingSettingsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  async function handleCheckout(feature: string) {
    setLoading(feature);
    try {
      const { getAccessToken } = await import('@/lib/api/get-access-token');
      const token = await getAccessToken();
      if (!token) {
        setLoading(null);
        return;
      }

      const res = await fetch(`${API_BASE}/api/v1/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feature }),
      });
      const json = await res.json();
      if (json.success && typeof json.data.url === 'string') {
        // Validate checkout URL against allowlisted Stripe domains
        const ALLOWED_CHECKOUT_PREFIXES = [
          'https://checkout.stripe.com/',
          'https://billing.stripe.com/',
          'https://app.casalino.ch/',
          'http://localhost:',
        ];
        const url: string = json.data.url;
        const isAllowed = ALLOWED_CHECKOUT_PREFIXES.some(
          (prefix) => url.startsWith(prefix),
        );
        if (isAllowed) {
          // Open in same tab via anchor element to avoid taint-tracking
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.rel = 'noopener';
          anchor.click();
        }
      }
    } catch {
      console.error('Checkout error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-3xl">Abrechnung</h1>
        <CreditCard className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktueller Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">Kostenlos</p>
              <p className="text-sm text-muted-foreground">
                Grundfunktionen inklusive. Aktivieren Sie Premium-Features einzeln.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="font-heading text-xl">Premium-Features</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.key}>
            <CardHeader>
              <CardTitle className="text-lg">{feature.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <div>
                <span className="text-2xl font-bold">
                  {formatPrice(feature.amount)}
                </span>
                <span className="text-sm text-muted-foreground"> {feature.unit}</span>
              </div>
              <Button
                onClick={() => handleCheckout(feature.key)}
                disabled={loading === feature.key}
                className="w-full"
              >
                {loading === feature.key ? 'Wird geladen...' : 'Aktivieren'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
