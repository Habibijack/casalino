import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Casalino – Vermietungsplattform',
    short_name: 'Casalino',
    description:
      'AI-gestuetztes Vermietungstool fuer Schweizer Immobilienverwaltungen.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#1A1714',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
