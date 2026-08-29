import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://beapana.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/terms',
          '/libro-de-reclamaciones',
          '/store-not-found',
          '/s/',
        ],
        disallow: [
          '/dashboard',
          '/admin',
          '/settings',
          '/orders',
          '/products',
          '/plans',
          '/qr',
          '/store/setup',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
