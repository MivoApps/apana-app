import { Metadata } from 'next';
import { getStoreBySlugFromFS } from '@/lib/firebase/firestore';

interface Props {
  params: Promise<{
    storeSlug: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);

  if (!store) {
    return {
      title: 'Tienda no encontrada | APANA',
      description: 'El catálogo o tienda que buscas no existe o ha cambiado de enlace.',
    };
  }

  const title = `${store.name} | Catálogo Online`;
  const description = store.description 
    ? store.description.slice(0, 160) 
    : `Explora el catálogo oficial de ${store.name}. Haz tu pedido online y recíbelo por WhatsApp de forma fácil y rápida.`;
  const storeUrl = `https://beapana.com/s/${encodeURIComponent(store.slug)}`;
  const bannerImage = store.bannerUrl || 'https://beapana.com/apana-real-preview.png';

  return {
    title,
    description,
    alternates: {
      canonical: storeUrl,
    },
    openGraph: {
      title: `${store.name} - Catálogo y Pedidos por WhatsApp`,
      description,
      url: storeUrl,
      type: 'website',
      locale: 'es_PE',
      siteName: 'APANA',
      images: [
        {
          url: bannerImage,
          width: 1200,
          height: 630,
          alt: `${store.name} en APANA`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${store.name} | Catálogo Online`,
      description,
      images: [bannerImage],
    },
  };
}

export default async function StoreLayout({ params, children }: Props) {
  const { storeSlug } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);

  const jsonLd = store
    ? {
        '@context': 'https://schema.org',
        '@type': 'Store',
        '@id': `https://beapana.com/s/${encodeURIComponent(store.slug)}#store`,
        name: store.name,
        description: store.description || `Catálogo digital y pedidos por WhatsApp de ${store.name}`,
        url: `https://beapana.com/s/${encodeURIComponent(store.slug)}`,
        telephone: store.whatsappPhone ? `+${store.whatsappPhone}` : undefined,
        image: store.bannerUrl || undefined,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'PE',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
