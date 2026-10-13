import React from 'react';
import { Metadata } from 'next';
import { getStoreBySlugFromFS, getProductsByStoreIdFromFS, getProductByIdFromFS } from '@/lib/firebase/firestore';
import StoreNotFoundPage from '@/app/(public)/store-not-found/page';
import PublicProductDetailClientView from './PublicProductDetailClientView';
import { formatCurrency } from '@/lib/whatsapp';

interface Props {
  params: Promise<{
    storeSlug: string;
    productId: string;
  }>;
}

export const dynamic = 'force-dynamic';

function toPlainObject<T>(data: T): T {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

/**
 * Genera metadatos dinámicos para previsualizaciones sociales ricas (WhatsApp, Facebook, Twitter)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug, productId } = await params;
  const store = await getStoreBySlugFromFS(storeSlug);

  if (!store || store.status === 'eliminada') {
    return {
      title: 'Producto no disponible | APANA',
      description: 'El producto o la tienda solicitada no se encuentran disponibles.',
    };
  }

  let product = await getProductByIdFromFS(store.id, productId);
  if (!product) {
    const prods = await getProductsByStoreIdFromFS(store.id);
    product = prods.find((p) => p.id === productId) || null;
  }

  if (!product) {
    return {
      title: `Producto no disponible | ${store.name}`,
      description: `Explora el catálogo oficial de ${store.name} en APANA.`,
    };
  }

  const formattedPrice = formatCurrency(product.price);
  const title = `${product.title} • ${formattedPrice} | ${store.name}`;
  const description = product.description
    ? `${product.description.slice(0, 150)} • Haz tu pedido fácil y rápido por WhatsApp.`
    : `Pide ${product.title} a ${store.name} directamente por WhatsApp a ${formattedPrice}. Entrega rápida y segura.`;

  const validImgs = (product.imageUrls || []).filter((u): u is string => Boolean(u && !u.startsWith('blob:')));
  let primaryImage = validImgs[0] || (product.imageUrl && !product.imageUrl.startsWith('blob:') ? product.imageUrl : null);

  if (!primaryImage) {
    primaryImage = store.logoUrl || 'https://beapana.com/apana-real-preview.png';
  }

  const productUrl = `https://beapana.com/s/${encodeURIComponent(store.slug)}/p/${encodeURIComponent(product.id)}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: `${store.name} en APANA`,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: `${product.title} - ${store.name}`,
        },
      ],
      type: 'website',
      locale: 'es_PE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

/**
 * Server Component SSR ultra-rápido para la página de detalle de producto.
 * Resuelve datos en servidor, inyecta etiquetas Open Graph y Schema.org estructuradas para WhatsApp y Google,
 * y envía el componente interactivo con datos pre-cargados (0 ms perceived latency).
 */
export default async function PublicProductPage({ params }: Props) {
  const { storeSlug, productId } = await params;

  if (!storeSlug || !productId) {
    return <StoreNotFoundPage />;
  }

  const rawStore = await getStoreBySlugFromFS(storeSlug);
  if (!rawStore || (rawStore.status !== 'activa' && rawStore.status !== 'pausada')) {
    return <StoreNotFoundPage />;
  }

  const rawProducts = await getProductsByStoreIdFromFS(rawStore.id);
  let rawProduct = rawProducts.find((p) => p.id === productId);
  if (!rawProduct) {
    rawProduct = (await getProductByIdFromFS(rawStore.id, productId)) || undefined;
    if (rawProduct) {
      rawProducts.push(rawProduct);
    }
  }

  if (!rawProduct) {
    return <StoreNotFoundPage />;
  }

  const store = toPlainObject(rawStore);
  const products = toPlainObject(rawProducts);
  const product = toPlainObject(rawProduct);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} disponible en ${store.name}.`,
    image: product.imageUrl ? [product.imageUrl] : (product.imageUrls || []),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: store.currency || 'PEN',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: store.name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <PublicProductDetailClientView
        storeSlug={storeSlug}
        productId={productId}
        initialStore={store}
        initialProducts={products}
        initialProduct={product}
      />
    </>
  );
}
