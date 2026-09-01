import { MetadataRoute } from 'next';
import { getAllStoresForAdminFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';

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

  // Rutas dinámicas de tiendas activas y sus productos
  try {
    const stores = await getAllStoresForAdminFromFS();
    const activeStores = stores.filter((s) => s.status !== 'pausada' && s.slug);

    const storeRoutes: MetadataRoute.Sitemap = [];
    const productRoutes: MetadataRoute.Sitemap = [];

    // Cargar productos en paralelo para todas las tiendas activas
    await Promise.all(
      activeStores.map(async (s) => {
        let lastMod = new Date();
        if (s.updatedAt) {
          const parsed = new Date(s.updatedAt);
          if (!isNaN(parsed.getTime())) {
            lastMod = parsed;
          }
        }

        // 1. Indexar tienda pública
        if (s.slug !== 'panaderia-don-jose') {
          storeRoutes.push({
            url: `${baseUrl}/s/${encodeURIComponent(s.slug)}`,
            lastModified: lastMod,
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }

        // 2. Indexar productos públicos individuales
        try {
          const products = await getProductsByStoreIdFromFS(s.id);
          const activeProducts = products.filter((p) => p.inStock);

          for (const prod of activeProducts) {
            let prodLastMod = lastMod;
            if (prod.createdAt) {
              const pDate = new Date(prod.createdAt);
              if (!isNaN(pDate.getTime())) {
                prodLastMod = pDate;
              }
            }

            productRoutes.push({
              url: `${baseUrl}/s/${encodeURIComponent(s.slug)}/p/${encodeURIComponent(prod.id)}`,
              lastModified: prodLastMod,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        } catch (prodErr) {
          console.warn(`Error obteniendo productos para sitemap de tienda ${s.slug}:`, prodErr);
        }
      })
    );

    return [...staticRoutes, ...storeRoutes, ...productRoutes];
  } catch (e) {
    console.error('Error generating dynamic sitemap:', e);
    return staticRoutes;
  }
}

