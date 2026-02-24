import type { Metadata, Viewport } from 'next';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://casalino.ch';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Casalino – Vermietungsplattform fuer die Schweiz',
    template: '%s | Casalino',
  },
  description:
    'AI-gestuetztes End-to-End-Vermietungstool fuer Schweizer Immobilienverwaltungen. Von der Bewerbung bis zum Vertrag – alles in einer Plattform.',
  keywords: [
    'Vermietung',
    'Immobilienverwaltung',
    'Schweiz',
    'Mietverwaltung',
    'Bewerbermanagement',
    'AI Scoring',
    'Mietvertrag',
    'PropTech',
    'Immobilien Software',
  ],
  authors: [{ name: 'SwissCreo GmbH' }],
  creator: 'SwissCreo GmbH',
  publisher: 'SwissCreo GmbH',
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    siteName: 'Casalino',
    title: 'Casalino – Vermietung. Intelligent vereinfacht.',
    description:
      'AI-gestuetztes Vermietungstool fuer Schweizer Immobilienverwaltungen. Bewerbermanagement, AI-Scoring, digitale Vertraege.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casalino – Vermietung. Intelligent vereinfacht.',
    description:
      'AI-gestuetztes Vermietungstool fuer Schweizer Immobilienverwaltungen.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A1714',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
