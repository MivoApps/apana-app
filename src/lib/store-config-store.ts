'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Store, StoreStyle } from '@/types/store';

interface StoreState {
  store: Store;
  updateStoreTheme: (themeStyle: StoreStyle, primaryColor: string, name?: string) => void;
}

export const useStoreConfig = create<StoreState>()(
  persist(
    (set) => ({
      store: {
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
      },
      updateStoreTheme: (themeStyle, primaryColor, name) =>
        set((state) => ({
          store: {
            ...state.store,
            themeStyle,
            primaryColor,
            name: name && name.trim() ? name : state.store.name,
          },
        })),
    }),
    {
      name: 'apana-store-config', // Nombre de la clave en localStorage
    }
  )
);
