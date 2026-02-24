import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://casalino.ch';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/impressum', '/agb', '/datenschutz'],
        disallow: [
          '/dashboard/',
          '/listings/',
          '/applicants/',
          '/viewings/',
          '/contracts/',
          '/settings/',
          '/insights/',
          '/notifications/',
          '/onboarding/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
