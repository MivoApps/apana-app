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
      title: 'Tienda no disponible | APANA',
      description: 'La tienda solicitada no existe o ha sido dada de baja.',
    };
  }

  const title = `${store.name} 🛍️ | Catálogo Oficial`;
  const description =
    store.description
      ? `${store.description.slice(0, 150)} • Haz tu pedido fácil por WhatsApp.`
      : `Explora el catálogo oficial de ${store.name} y haz tus pedidos directamente por WhatsApp. Envíos y atención personalizada.`;

  // Determinación inteligente de la imagen para OpenGraph (WhatsApp, Instagram, Facebook)
  let shareImage =
    (store.logoUrl && !store.logoUrl.startsWith('blob:') ? store.logoUrl : null) ||
    (store.bannerUrl && !store.bannerUrl.startsWith('blob:') ? store.bannerUrl : null);

  if (!shareImage) {
    // Si la tienda aún no subió logo o banner, utilizamos la foto de su primer producto activo
    try {
      const prods = await getProductsByStoreIdFromFS(store.id);
      const prodWithImg = prods.find((p) => {
        const firstArrImg = (p.imageUrls || []).find((img) => img && !img.startsWith('blob:'));
        return (p.imageUrl && !p.imageUrl.startsWith('blob:')) || Boolean(firstArrImg);
      });
      if (prodWithImg) {
        shareImage =
          (prodWithImg.imageUrl && !prodWithImg.imageUrl.startsWith('blob:') ? prodWithImg.imageUrl : null) ||
          (prodWithImg.imageUrls || []).find((img) => img && !img.startsWith('blob:')) ||
          null;
      }
    } catch {
      // Ignorar fallback a productos si falla la consulta
    }
  }

  if (!shareImage) {
    shareImage = 'https://beapana.com/apana-real-preview.png';
  }

  const storeUrl = `https://beapana.com/s/${encodeURIComponent(store.slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: storeUrl,
    },
    openGraph: {
      title,
      description,
      url: storeUrl,
      siteName: `${store.name} en APANA`,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${store.name} - Catálogo Online`,
        },
      ],
      type: 'website',
      locale: 'es_PE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage],
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
