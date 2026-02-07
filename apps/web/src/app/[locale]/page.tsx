import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const user = await getUser();

  // Logged-in users go to dashboard
  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  return <HomeContent locale={locale} />;
}

function HomeContent({ locale }: { locale: string }) {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight font-heading text-foreground">
            {t('common.appName')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('common.tagline')}
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <a href={`/${locale}/login`}>
            <Button>{t('home.searchButton')}</Button>
          </a>
          <Button variant="secondary">{t('home.learnMore')}</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('home.features.search.title')}
              </CardTitle>
              <CardDescription>
                {t('home.features.search.description')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('home.features.multilingual.title')}
              </CardTitle>
              <CardDescription>
                {t('home.features.multilingual.description')}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('home.features.dossier.title')}
              </CardTitle>
              <CardDescription>
                {t('home.features.dossier.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex gap-2 justify-center">
          <a
            href="/de"
            className="px-3 py-1 rounded-full border border-border text-sm hover:bg-card transition-colors"
          >
            Deutsch
          </a>
          <a
            href="/fr"
            className="px-3 py-1 rounded-full border border-border text-sm hover:bg-card transition-colors"
          >
            Français
          </a>
          <a
            href="/it"
            className="px-3 py-1 rounded-full border border-border text-sm hover:bg-card transition-colors"
          >
            Italiano
          </a>
        </div>
      </div>
    </main>
  );
}
