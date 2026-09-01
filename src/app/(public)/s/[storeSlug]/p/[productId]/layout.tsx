import { Metadata } from 'next';
import { getStoreBySlugFromFS, getProductsByStoreIdFromFS } from '@/lib/firebase/firestore';

interface Props {
  params: Promise<{
    storeSlug: string;
    productId: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string; productId: string }> }): Promise<Metadata> {
  const { storeSlug, productId } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);

  if (!store) {
    return {
      title: 'Producto | APANA',
    };
  }

  const products = await getProductsByStoreIdFromFS(store.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return {
      title: `Producto no disponible | ${store.name}`,
      description: `El producto que buscas ya no está disponible en la tienda de ${store.name}.`,
    };
  }

  const title = `${product.title} - S/ ${product.price.toFixed(2)} | ${store.name}`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Compra ${product.title} en ${store.name} a solo S/ ${product.price.toFixed(2)}. Pedidos rápidos y seguros por WhatsApp.`;
  const productUrl = `https://beapana.com/s/${encodeURIComponent(store.slug)}/p/${encodeURIComponent(product.id)}`;
  const productImage = product.imageUrl || store.bannerUrl || 'https://beapana.com/apana-real-preview.png';

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.title} - S/ ${product.price.toFixed(2)}`,
      description,
      url: productUrl,
      type: 'website',
      locale: 'es_PE',
      siteName: store.name,
      images: [
        {
          url: productImage,
          width: 800,
          height: 800,
          alt: `${product.title} - ${store.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | ${store.name}`,
      description,
      images: [productImage],
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { storeSlug, productId } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);
  let productJsonLd = null;

  if (store) {
    const products = await getProductsByStoreIdFromFS(store.id);
    const product = products.find((p) => p.id === productId);

    if (product) {
      productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description || product.title,
        image: product.imageUrl ? [product.imageUrl] : undefined,
        offers: {
          '@type': 'Offer',
          url: `https://beapana.com/s/${encodeURIComponent(store.slug)}/p/${encodeURIComponent(product.id)}`,
          priceCurrency: 'PEN',
          price: product.price.toFixed(2),
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: store.name,
          },
        },
      };
    }
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
