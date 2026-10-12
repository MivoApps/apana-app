import React from 'react';
import { Metadata } from 'next';
import { getStoreBySlugFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';
import PublicStoreClientView from './PublicStoreClientView';

interface Props {
  params: Promise<{
    storeSlug: string;
  }>;
}

// Forzar renderizado dinámico en servidor para garantizar datos en tiempo real
export const dynamic = 'force-dynamic';

/**
 * Función auxiliar para sanitizar y serializar objetos de Firestore.
 * Convierte clases con métodos (como Timestamps con .toJSON()) en objetos JSON planos
 * requeridos por Next.js al cruzar la frontera Server Component -> Client Component.
 */
function toPlainObject<T>(data: T): T {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

/**
 * Genera metadatos dinámicos para SEO y previsualizaciones enriquecidas en WhatsApp, Facebook y Twitter
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);

  if (!store || store.status === 'eliminada') {
    return {
      title: 'Tienda no encontrada | APANA',
      description: 'La tienda solicitada no existe o ha sido dada de baja.',
    };
  }

  const title = `${store.name} | Catálogo Online en APANA`;
  const description =
    store.description ||
    `Explora el catálogo de productos de ${store.name} y haz tus pedidos fácilmente por WhatsApp.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://beapana.com/s/${store.slug}`,
      siteName: 'APANA',
      images: store.logoUrl ? [{ url: store.logoUrl, alt: store.name }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: store.logoUrl ? [store.logoUrl] : undefined,
    },
  };
}

/**
 * Página pública de Tienda (Server Component SSR ultra rápido).
 * Consulta Firestore en el servidor (30ms) y devuelve el HTML ya cocinado al cliente.
 * Elimina completamente el skeleton de 30 segundos y la espera de JavaScript en el móvil.
 */
export default async function PublicStorePage({ params }: Props) {
  const { storeSlug } = await params;

  if (!storeSlug) {
    return <StoreNotFoundPage />;
  }

  // 1. Obtener datos de la tienda directamente en el servidor
  const rawStore = await getStoreBySlugFromFS(storeSlug);

  if (!rawStore || (rawStore.status !== 'activa' && rawStore.status !== 'pausada')) {
    return <StoreNotFoundPage />;
  }

  // 2. Obtener productos de la tienda directamente en el servidor
  const rawProducts = await getProductsByStoreIdFromFS(rawStore.id);

  // 3. Serializar objetos planos (elimina instancias Timestamp/toJSON para cumplir la regla de Next.js RSC)
  const store = toPlainObject(rawStore);
  const products = toPlainObject(rawProducts);

  return (
    <>
      {/* SEO Structured Data Schema.org pre-renderizado en servidor */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: store.name,
            description:
              store.description ||
              `Tienda online oficial de ${store.name}. Realiza tus pedidos por WhatsApp.`,
            url: `https://beapana.com/s/${store.slug}`,
            ...(store.logoUrl ? { image: store.logoUrl } : {}),
            ...(store.whatsappPhone ? { telephone: store.whatsappPhone } : {}),
            priceRange: '$$',
            address: {
              '@type': 'PostalAddress',
              ...(store.city ? { addressLocality: store.city } : {}),
              ...(store.department ? { addressRegion: store.department } : {}),
              addressCountry: 'PE',
            },
          }),
        }}
      />

      {/* Vista interactiva de cliente con datos planos pre-cargados al 100% */}
      <PublicStoreClientView
        initialStore={store}
        initialProducts={products}
        storeSlug={storeSlug}
      />
    </>
  );
}
