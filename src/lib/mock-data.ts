'use client';

import { Store, Product } from '@/types/store';

export const MOCK_STORE: Store = {
  id: 'store-1',
  slug: 'panaderia-don-jose',
  name: 'Panadería Don José',
  description: 'Pan artesanal, pasteles y café recién elaborado todos los días.',
  whatsappPhone: '573001234567',
  ownerId: 'user-1',
  status: 'activa',
  themeStyle: 'minimalista',
  primaryColor: '#059669',
  createdAt: Date.now(),
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    storeId: 'store-1',
    title: 'Pan de Bono Tradicional (6 uds)',
    description: 'Recién horneados, crujientes por fuera y suaves por dentro.',
    price: 12000,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    inStock: true,
    createdAt: Date.now(),
  },
  {
    id: 'p-2',
    storeId: 'store-1',
    title: 'Almojábana Casera',
    description: 'Queso campesino fresco y horneado artesanal.',
    price: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80',
    inStock: true,
    createdAt: Date.now(),
  },
  {
    id: 'p-3',
    storeId: 'store-1',
    title: 'Café Especial Origen 250g',
    description: 'Café tostado artesanal con notas a chocolate y miel.',
    price: 24000,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
    inStock: true,
    createdAt: Date.now(),
  },
];
