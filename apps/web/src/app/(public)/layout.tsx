import { cookies } from 'next/headers';
import { type Locale, DEFAULT_LOCALE, isLocale } from '@/lib/i18n';
import { LOCALE_COOKIE_NAME } from '@/lib/i18n/detect-locale';
import { PublicLayoutClient } from './layout-client';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: Locale = cookieLang && isLocale(cookieLang)
    ? cookieLang
    : DEFAULT_LOCALE;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <span className="text-lg font-bold">Casalino</span>
          <PublicLayoutClient locale={locale} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
