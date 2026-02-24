import { cookies } from 'next/headers';
import { Card, CardContent } from '@casalino/ui';
import { ReferenceForm } from './client';
import { getTranslations, type Locale } from '@/lib/i18n';
import { detectLocale, LOCALE_COOKIE_NAME } from '@/lib/i18n/detect-locale';

interface ReferencePublicData {
  id: string;
  status: string;
  applicantName: string;
  landlordName: string;
  expiresAt: string | null;
}

export default async function ReferenceFormPage(
  props: {
    params: Promise<{ token: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  },
) {
  const { token } = await props.params;
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: Locale = detectLocale(searchParams, cookieValue);
  const t = await getTranslations(locale, 'reference');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  let data: ReferencePublicData | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/reference/${token}`,
      { cache: 'no-store' },
    );
    const json = await res.json();

    if (json.success) {
      data = json.data;
    } else {
      errorMessage = json.error?.message ?? t('notFound');
    }
  } catch {
    errorMessage = t('connectionError');
  }

  if (errorMessage || !data) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">
            {errorMessage ?? t('notFound')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.status === 'completed') {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="py-12 text-center">
          <h2 className="mb-2 text-xl font-bold">
            {t('alreadyCompletedTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('alreadyCompletedMessage')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data.status === 'expired') {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="py-12 text-center">
          <h2 className="mb-2 text-xl font-bold">
            {t('expiredTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('expiredMessage')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('referenceFor')} {data.applicantName}
        </p>
      </div>

      <ReferenceForm
        token={token}
        applicantName={data.applicantName}
        locale={locale}
      />
    </div>
  );
}
