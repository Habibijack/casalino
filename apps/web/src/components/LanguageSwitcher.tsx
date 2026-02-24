'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@casalino/ui';
import {
  type Locale,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
} from '@/lib/i18n';
import { LOCALE_COOKIE_NAME } from '@/lib/i18n/detect-locale';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

function setLocaleCookie(locale: Locale): void {
  const secure = window.location.protocol === 'https:' ? ';Secure' : '';
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLocaleChange = useCallback(
    (locale: Locale) => {
      setLocaleCookie(locale);
      const params = new URLSearchParams(searchParams.toString());
      params.set('lang', locale);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span>{LOCALE_LABELS[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={locale === currentLocale ? 'font-bold' : ''}
          >
            {LOCALE_LABELS[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
