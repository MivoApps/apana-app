import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'APANA | Tienda online y Ventas por WhatsApp',
    short_name: 'APANA',
    description: 'Una forma más sencilla de llevar tu negocio al mundo digital.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9ff',
    theme_color: '#059669',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
