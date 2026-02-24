import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  Building2,
  Users,
  BarChart3,
  FileText,
  Shield,
  Zap,
} from 'lucide-react';
import { Button, Card, CardContent } from '@casalino/ui';
import { getTranslations, type Locale } from '@/lib/i18n';
import { detectLocale, LOCALE_COOKIE_NAME } from '@/lib/i18n/detect-locale';
import { MarketingLanguageSwitcher } from './marketing-lang-switcher';

export const metadata: Metadata = {
  title: 'Casalino -- Vermietung. Intelligent vereinfacht.',
  description:
    'AI-gestuetztes End-to-End-Vermietungstool fuer Schweizer Immobilienverwaltungen. Bewerbermanagement, AI-Scoring, digitale Vertraege -- alles in einer Plattform.',
  alternates: {
    canonical: '/',
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://casalino.ch';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'SwissCreo GmbH',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'CH',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Casalino',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'AI-gestuetztes Vermietungstool fuer Schweizer Immobilienverwaltungen.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CHF',
        description: 'Kostenloser Start, Premium-Features nach Bedarf.',
      },
    },
  ],
};

type FeatureIcon = typeof Users;

function getFeatures(t: (key: string) => string): Array<{
  icon: FeatureIcon;
  title: string;
  text: string;
}> {
  return [
    { icon: Users, title: t('featureApplicants'), text: t('featureApplicantsDesc') },
    { icon: Zap, title: t('featureScoring'), text: t('featureScoringDesc') },
    { icon: Building2, title: t('featureListings'), text: t('featureListingsDesc') },
    { icon: FileText, title: t('featureContracts'), text: t('featureContractsDesc') },
    { icon: BarChart3, title: t('featureInsights'), text: t('featureInsightsDesc') },
    { icon: Shield, title: t('featurePrivacy'), text: t('featurePrivacyDesc') },
  ];
}

export default async function LandingPage(
  props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  },
) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: Locale = detectLocale(searchParams, cookieValue);
  const t = await getTranslations(locale, 'marketing');

  const features = getFeatures(t);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <span className="font-heading text-2xl">Casalino</span>
        <div className="flex items-center gap-3">
          <MarketingLanguageSwitcher locale={locale} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">{t('login')}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="font-heading text-5xl tracking-tight sm:text-6xl lg:text-7xl">
          {t('heroTitle1')} <br className="hidden sm:block" />
          {t('heroTitle2')}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          {t('heroSubtitle')}
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/login">{t('ctaStart')}</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-6 py-20 lg:px-12">
        <h2 className="mb-12 text-center font-heading text-3xl">
          {t('featuresTitle')}
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="flex flex-col gap-3 py-6">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="font-heading text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center lg:px-12">
        <h2 className="font-heading text-3xl">{t('ctaTitle')}</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          {t('ctaSubtitle')}
        </p>
        <Button className="mt-8" size="lg" asChild>
          <Link href="/login">{t('ctaButton')}</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('footerCopyright')}
          </p>
          <nav className="flex gap-6">
            <Link
              href="/impressum"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('impressum')}
            </Link>
            <Link
              href="/agb"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('agb')}
            </Link>
            <Link
              href="/datenschutz"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('datenschutz')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
