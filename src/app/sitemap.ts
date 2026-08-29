import { MetadataRoute } from 'next';
import { getAllStoresForAdminFromFS } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://beapana.com';

  // Rutas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/s/panaderia-don-jose`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/libro-de-reclamaciones`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Rutas dinámicas de tiendas activas
  try {
    const stores = await getAllStoresForAdminFromFS();
    const activeStores = stores.filter((s) => s.status === 'activa' && s.slug && s.slug !== 'panaderia-don-jose');

    const storeRoutes: MetadataRoute.Sitemap = activeStores.map((s) => {
      let lastMod = new Date();
      if (s.updatedAt) {
        const parsed = new Date(s.updatedAt);
        if (!isNaN(parsed.getTime())) {
          lastMod = parsed;
        }
      }
      return {
        url: `${baseUrl}/s/${encodeURIComponent(s.slug)}`,
        lastModified: lastMod,
        changeFrequency: 'daily',
        priority: 0.7,
      };
    });

    return [...staticRoutes, ...storeRoutes];
  } catch (e) {
    console.error('Error generating dynamic sitemap:', e);
    return staticRoutes;
  }
}
