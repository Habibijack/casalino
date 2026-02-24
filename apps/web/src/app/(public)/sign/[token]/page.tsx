'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@casalino/ui';
import { type Locale, DEFAULT_LOCALE, isLocale } from '@/lib/i18n';
import { signDictionary } from '@/lib/i18n/dictionaries/sign';
import { LOCALE_COOKIE_NAME } from '@/lib/i18n/detect-locale';

interface ContractPublicData {
  id: string;
  status: string;
  contractData: {
    tenantName: string;
    tenantEmail: string;
    rentAmount: number;
    nkAmount?: number;
    startDate: string;
    endDate?: string;
    specialClauses?: string[];
  } | null;
  signedAt: string | null;
  listingAddress: string;
  listingCity: string;
  applicantName: string;
}

function formatPrice(chf: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
  }).format(chf);
}

function getLocaleFromCookieClient(): Locale | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`));
  const value = match?.split('=')[1];
  if (value && isLocale(value)) return value;
  return null;
}

function useSignTranslation(): (key: string) => string {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  let locale: Locale = DEFAULT_LOCALE;

  if (langParam && isLocale(langParam)) {
    locale = langParam;
  } else if (typeof document !== 'undefined') {
    locale = getLocaleFromCookieClient() ?? DEFAULT_LOCALE;
  }

  const dict = signDictionary[locale] ?? signDictionary[DEFAULT_LOCALE];
  const fallback = signDictionary[DEFAULT_LOCALE];

  return (key: string) => dict[key] ?? fallback[key] ?? key;
}

export default function SignContractPage() {
  const params = useParams();
  const token = params?.token;
  const t = useSignTranslation();
  const [contract, setContract] = useState<ContractPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  useEffect(() => {
    if (!token || typeof token !== 'string') return;

    fetch(`${API_BASE}/api/v1/public/contracts/sign/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setContract(json.data);
          if (json.data.status === 'signed') {
            setSigned(true);
          }
        } else {
          setError(json.error?.message ?? t('notFound'));
        }
      })
      .catch(() => setError(t('connectionError')))
      .finally(() => setLoading(false));
  }, [token, API_BASE, t]);

  async function handleSign() {
    if (!token || typeof token !== 'string') return;
    setSigning(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/public/contracts/sign/${token}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      );
      const json = await res.json();
      if (json.success) {
        setSigned(true);
      } else {
        setError(json.error?.message ?? t('signError'));
      }
    } catch {
      setError(t('connectionError'));
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (error && !contract) {
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

  if (!contract) return null;

  const data = contract.contractData;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {signed ? (
        <Card className="border-success">
          <CardContent className="py-12 text-center">
            <Check className="mx-auto mb-4 h-12 w-12 text-success" />
            <h2 className="mb-2 text-2xl font-bold text-success">
              {t('signedTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('signedMessage')
                .replace('{name}', contract.applicantName)
                .replace('{address}', contract.listingAddress)
                .replace('{city}', contract.listingCity)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="font-heading text-3xl">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">
              {contract.listingAddress}, {contract.listingCity}
            </p>
          </div>

          {data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('contractOverview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-muted-foreground">{t('tenant')}</span>
                  <span className="font-medium">{data.tenantName}</span>
                  <span className="text-muted-foreground">
                    {t('rentalProperty')}
                  </span>
                  <span className="font-medium">
                    {contract.listingAddress}, {contract.listingCity}
                  </span>
                  <span className="text-muted-foreground">{t('rent')}</span>
                  <span className="font-medium">
                    {formatPrice(data.rentAmount)} {t('perMonth')}
                  </span>
                  {data.nkAmount !== undefined && (
                    <>
                      <span className="text-muted-foreground">
                        {t('additionalCosts')}
                      </span>
                      <span className="font-medium">
                        {formatPrice(data.nkAmount)} {t('perMonth')}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">
                    {t('startDate')}
                  </span>
                  <span className="font-medium">{data.startDate}</span>
                  {data.endDate && (
                    <>
                      <span className="text-muted-foreground">
                        {t('endDate')}
                      </span>
                      <span className="font-medium">{data.endDate}</span>
                    </>
                  )}
                </div>

                {data.specialClauses && data.specialClauses.length > 0 && (
                  <div className="pt-2">
                    <p className="font-medium">{t('specialClauses')}</p>
                    <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                      {data.specialClauses.map((clause, i) => (
                        <li key={i}>{clause}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleSign}
            disabled={signing}
            className="w-full"
            size="lg"
          >
            {signing ? t('signing') : t('signButton')}
          </Button>
        </div>
      )}
    </div>
  );
}
