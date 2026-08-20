import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'APANA | Catálogo Digital y Ventas por WhatsApp',
    short_name: 'APANA',
    description: 'La plataforma más rápida para crear tu tienda online, catálogo con QR y recibir pedidos directos a WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9ff',
    theme_color: '#059669',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
