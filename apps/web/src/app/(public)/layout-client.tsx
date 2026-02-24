'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { type Locale, isLocale } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface PublicLayoutClientProps {
  locale: Locale;
}

function LanguageSwitcherWithParams({ fallbackLocale }: { fallbackLocale: Locale }) {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  const resolvedLocale = langParam && isLocale(langParam)
    ? langParam
    : fallbackLocale;

  return <LanguageSwitcher currentLocale={resolvedLocale} />;
}

export function PublicLayoutClient({ locale }: PublicLayoutClientProps) {
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherWithParams fallbackLocale={locale} />
    </Suspense>
  );
}
