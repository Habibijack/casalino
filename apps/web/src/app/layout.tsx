import type { Metadata, Viewport } from 'next';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Casalino -- Vermietungsplattform',
  description:
    'AI-gestuetztes End-to-End-Vermietungstool fuer Schweizer Immobilienverwaltungen.',
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
