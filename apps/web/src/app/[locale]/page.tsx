import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight font-heading text-foreground">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground font-body">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button>{t('searchButton')}</Button>
          <Button variant="secondary">{t('learnMore')}</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('features.search.title')}</CardTitle>
              <CardDescription>{t('features.search.description')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('features.multilingual.title')}</CardTitle>
              <CardDescription>{t('features.multilingual.description')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('features.dossier.title')}</CardTitle>
              <CardDescription>{t('features.dossier.description')}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex gap-2 justify-center">
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
