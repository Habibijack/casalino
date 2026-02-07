import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Casalino – Dein KI-Wohnungsassistent',
  description:
    'Finde deine Traumwohnung in der Schweiz mit KI-Unterstützung. Mehrsprachig, intelligent, schnell.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Casalino',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#E8503E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
