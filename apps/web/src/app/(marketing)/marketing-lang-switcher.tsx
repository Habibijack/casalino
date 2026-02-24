'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { type Locale, isLocale } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface MarketingLanguageSwitcherProps {
  locale: Locale;
}

function SwitcherWithParams({ fallbackLocale }: { fallbackLocale: Locale }) {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  const resolvedLocale = langParam && isLocale(langParam)
    ? langParam
    : fallbackLocale;

  return <LanguageSwitcher currentLocale={resolvedLocale} />;
}

export function MarketingLanguageSwitcher({ locale }: MarketingLanguageSwitcherProps) {
  return (
    <Suspense fallback={null}>
      <SwitcherWithParams fallbackLocale={locale} />
    </Suspense>
  );
}
