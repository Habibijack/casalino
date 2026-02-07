import { getSearchProfiles } from '@/lib/search-profiles/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileCard } from './profile-card';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SearchProfilesPage({ params }: Props) {
  const { locale } = await params;
  const profiles = await getSearchProfiles();
  const t = await getTranslations('searchProfile');

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">{t('title')}</h1>
        {profiles.length < 5 && (
          <a href={`/${locale}/search-profiles/new`}>
            <Button size="sm">+ {t('create')}</Button>
          </a>
        )}
      </div>

      {profiles.length > 0 ? (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} locale={locale} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">{t('noProfiles')}</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {locale === 'fr'
                ? 'Crée ton premier profil pour trouver des appartements.'
                : locale === 'it'
                  ? 'Crea il tuo primo profilo per trovare appartamenti.'
                  : 'Erstelle dein erstes Profil um passende Wohnungen zu finden.'}
            </p>
            <a href={`/${locale}/search-profiles/new`}>
              <Button>{t('create')}</Button>
            </a>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
