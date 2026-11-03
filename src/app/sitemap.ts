import { MetadataRoute } from 'next';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getAllStoresForAdminFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://beapana.com';

  // 1. Rutas estáticas principales con máxima prioridad
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
      url: `${baseUrl}/privacy`,
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

  // 2. Rutas dinámicas de tiendas activas y sus productos
  const storeRoutes: MetadataRoute.Sitemap = [];
  const productRoutes: MetadataRoute.Sitemap = [];

  try {
    const adminDb = getAdminFirestore();
    const storesSnap = await adminDb.collection('stores').get();
    
    await Promise.all(
      storesSnap.docs.map(async (docSnap) => {
        const s = docSnap.data();
        if (s.status === 'pausada' || !s.slug) return;

        let lastMod = new Date();
        if (s.updatedAt) {
          const parsed = s.updatedAt.toDate ? s.updatedAt.toDate() : new Date(s.updatedAt);
          if (!isNaN(parsed.getTime())) {
            lastMod = parsed;
          }
        }

        // Indexar tienda pública
        if (s.slug !== 'panaderia-don-jose') {
          storeRoutes.push({
            url: `${baseUrl}/s/${encodeURIComponent(s.slug)}`,
            lastModified: lastMod,
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }

        // Indexar productos públicos individuales
        try {
          const productsSnap = await docSnap.ref.collection('products').where('inStock', '==', true).get();
          for (const pDoc of productsSnap.docs) {
            const prod = pDoc.data();
            let prodLastMod = lastMod;
            if (prod.updatedAt) {
              const pDate = prod.updatedAt.toDate ? prod.updatedAt.toDate() : new Date(prod.updatedAt);
              if (!isNaN(pDate.getTime())) prodLastMod = pDate;
            } else if (prod.createdAt) {
              const pDate = prod.createdAt.toDate ? prod.createdAt.toDate() : new Date(prod.createdAt);
              if (!isNaN(pDate.getTime())) prodLastMod = pDate;
            }

            productRoutes.push({
              url: `${baseUrl}/s/${encodeURIComponent(s.slug)}/p/${encodeURIComponent(pDoc.id)}`,
              lastModified: prodLastMod,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        } catch (prodErr) {
          console.warn(`Aviso obteniendo productos de tienda ${s.slug} para sitemap:`, prodErr);
        }
      })
    );

    return [...staticRoutes, ...storeRoutes, ...productRoutes];
  } catch (adminErr) {
    console.warn('Aviso usando Admin Firestore en sitemap, intentando fallback de cliente:', adminErr);

    // Fallback: usar cliente estándar
    try {
      const stores = await getAllStoresForAdminFromFS();
      const activeStores = stores.filter((s) => s.status !== 'pausada' && s.slug);

      await Promise.all(
        activeStores.map(async (s) => {
          let lastMod = new Date();
          if (s.updatedAt) {
            const parsed = new Date(s.updatedAt);
            if (!isNaN(parsed.getTime())) lastMod = parsed;
          }

          if (s.slug !== 'panaderia-don-jose') {
            storeRoutes.push({
              url: `${baseUrl}/s/${encodeURIComponent(s.slug)}`,
              lastModified: lastMod,
              changeFrequency: 'daily',
              priority: 0.8,
            });
          }

          try {
            const products = await getProductsByStoreIdFromFS(s.id);
            const activeProducts = products.filter((p) => p.inStock);

            for (const prod of activeProducts) {
              let prodLastMod = lastMod;
              if (prod.createdAt) {
                const pDate = new Date(prod.createdAt);
                if (!isNaN(pDate.getTime())) prodLastMod = pDate;
              }

              productRoutes.push({
                url: `${baseUrl}/s/${encodeURIComponent(s.slug)}/p/${encodeURIComponent(prod.id)}`,
                lastModified: prodLastMod,
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            }
          } catch (e) {}
        })
      );

      return [...staticRoutes, ...storeRoutes, ...productRoutes];
    } catch (e) {
      console.error('Error generando sitemap final:', e);
      return staticRoutes;
    }
  }
}
